export const isAuthRoute = (path) => {
    return ["/", "/forgot-password", "/signup","/maintenance"].includes(path);
  };