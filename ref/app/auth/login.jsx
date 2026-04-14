import LoginAuth from "@/components/auth/login-auth";

const Login = () => {
  return (
    <>
      <div className="relative w-full min-h-screen overflow-hidden">
        <div className="relative z-10">
          <LoginAuth />
        </div>
      </div>
    </>
  );
};

export default Login;
