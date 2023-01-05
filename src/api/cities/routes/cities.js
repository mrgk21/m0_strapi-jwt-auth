module.exports = {
  routes: [
    {
      method: "GET",
      path: "/cities",
      handler: "cities.exampleAction",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
