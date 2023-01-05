import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import { Buffer } from "buffer";
window.Buffer = Buffer;
import "./App.css";

let web3;
const serverUrl = "http://localhost:3000/web3/auth";

function App() {
	const [accounts, setAccounts] = useState([]);
	const [sign, setSign] = useState([]);
	const [perSign, setPerSign] = useState([]);
	const [token, setToken] = useState([]);

	const errorMsgHandler = (err) => {
		console.log(`Error ${err.code}: ${err.message}`);
	};

	const { ethereum } = window;
	useEffect(() => {
		if (ethereum !== undefined) {
			web3 = new Web3(ethereum);
			ethereum.on("accountsChanged", (acc) => {
				setAccounts(acc);
			});
			ethereum
				.request({ method: "eth_accounts" })
				.then((acc) => {
					console.log("Metamask connected");
					setAccounts(acc);
				})
				.catch(errorMsgHandler);
		}
	}, []);

	const connectWallet = async () => {
		await window.ethereum
			.request({ method: "eth_requestAccounts" })
			.then(setAccounts)
			.catch((err) => console.log(err));
		console.log(accounts);
	};

	const signMessage = async () => {
		const signatureObj = [accounts[0], web3.utils.sha3(`Authentication token: ${token}`)];
		await ethereum
			.request({ method: "eth_sign", params: [...signatureObj] })
			.then(setSign)
			.catch((err) => {
				console.log(err);
			});
	};

	const personalSignMessage = async (e) => {
		e.preventDefault();
		const { target } = e;
		const signatureObj = [
			accounts[0],
			`0x${Buffer.from(`Your authentication token : ${target[0].value}`, "utf8").toString(
				"hex"
			)}`,
		];
		await ethereum
			.request({ method: "personal_sign", params: [...signatureObj] })
			.then(setPerSign)
			.catch((err) => {
				console.log(err);
			});
	};

	const handleUserData = async (e) => {
		e.preventDefault();
		const { target } = e;
		const { data: web3Token } = await axios
			.post(serverUrl, {
				walletAddress: accounts[0],
				name: target[0].value,
				email: target[1].value,
			})
			.catch((err) => {
				console.log(err);
			});
		console.log(web3Token);
		setToken(web3Token);
	};

	const sendRequest = async () => {
		const { data } = await axios.get("http://localhost:1337/api/cities", {
			headers: {
				authorization:
					"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjcyOTM5NTMzLCJleHAiOjE2NzU1MzE1MzN9.x-Id1HPUAweVDY82w17RwmdVEz1KKmCvqSe4JDyQZks",
			},
		});
		console.log(data);
	};

	return (
		<React.Fragment>
			<h1>Web3 Login:</h1>
			<button onClick={connectWallet}>Connect to wallet</button>
			<p>account: {accounts[0] ? accounts[0] : ""}</p>
			<form onSubmit={(e) => personalSignMessage(e)}>
				<input name="token-input" />
				<button>Sign a personal message</button>
			</form>
			<p>signature: {perSign ? perSign : ""}</p>
			<p>JWT_token: {token ? token : ""}</p>
			<div className="form">
				<form onSubmit={(e) => handleUserData(e)}>
					<h2>Enter details:</h2>
					<label>User name:</label>
					<input placeholder="Enter username:" />
					<label>E-mail:</label>
					<input placeholder="Enter e-mail:" />
					<button>Login</button>
				</form>
			</div>
			<button onClick={sendRequest}>Click me</button>
		</React.Fragment>
	);
}

export default App;
