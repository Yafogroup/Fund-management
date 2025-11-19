import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography, CardBody,
} from "@material-tailwind/react";
import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import authService from "@/api/authService.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import messages from "@/const/msg.jsx";
import Helper from "@/helper.jsx";
import {useAuth} from "@/context/AuthContext.jsx";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline/index.js";


export function SignIn() {

  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const doLogin = async () => {

    if (email === "" || !Helper.isValidEmail(email)) {
      showNotification(messages.input_email, 'red');
      return;
    }

    if (password === "") {
      showNotification(messages.input_password, 'red');
      return;
    }

    const response = await authService.login(email, password)
    if (response.data.status === "success") {
      login({
        auth_token: response.data.data.auth_token,
        role: response.data.data.role,
        user_token: response.data.data.user_token,
        event_list: response.data.data.event_list,
      });
      navigate("/dashboard/home");
    } else {
      showNotification(response.data.message, 'red');
    }
  }

  const doSignUp = async () => {
    navigate("/auth/sign-up");
  }

  return (
    <section className="relative min-h-screen">
      <img
          src="/img/bg.png"
          className="h-full w-full object-center absolute"
      />
      <Card className="w-1/2 h-max bg-sidebar mx-auto absolute left-[25%] top-[20%]">
        <CardBody className="p-0">
          <div className="flex flex-row relative">
            <img
              src="/img/logo.png"
              className="object-contain absolute top-10 left-10"
            />
            <img
                src="/img/bg_login.jpg"
                className="w-[50%] object-cover rounded-l-lg"
            />
            <div className="w-1/2">
              <Typography className="text-center text-gray-300 text-[25px] mt-[10%]">Welcome to YAFO</Typography>
              <form className="mt-4 mx-auto w-3/4">
                <div className="mb-1 flex flex-col gap-6">
                  <div className="bg-cBlue3 rounded-lg px-2">
                    <Input
                        placeholder="Email"
                        className="border-none text-gray-300 text-[16px]"
                        size="lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="bg-cBlue3 rounded-lg px-2">
                    <Input
                        placeholder="Password"
                        type="password"
                        size="lg"
                        className="border-none text-gray-300 text-[16px]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            doLogin();
                          }}
                        }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <Checkbox
                      label={
                        <Typography
                            variant="small"
                            color="text-gray-600"
                            className="flex items-center justify-start font-medium"
                        >
                          I agree the&nbsp;
                          <a
                              href="#"
                              className="font-normal text-gray-600 transition-colors hover:text-gray-900 underline"
                          >
                            Terms and Conditions
                          </a>
                        </Typography>
                      }
                      containerProps={{ className: "-ml-2.5" }}
                  />
                  <Typography variant="small" className="font-medium text-lBLue1">
                    <a href="#">
                      Forgot Password
                    </a>
                  </Typography>
                </div>
                <Button className="mt-6 bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce] text-[15px] font-normal" fullWidth onClick={doLogin}>
                  Sign In
                </Button>

                <div className="flex items-center justify-center w-full my-4">
                  <div className="flex-grow border-t border-gray-700"></div>
                  <Typography
                      variant="small"
                      color="gray"
                      className="mx-3 text-sm text-gray-400"
                  >
                    Not registered ?
                  </Typography>
                  <div className="flex-grow border-t border-gray-700"></div>
                </div>
                <Button className="mt-6 bg-transparent border-[1px] border-gray-500 text-[15px] font-normal" fullWidth onClick={doSignUp}>
                  Create Account
                </Button>
              </form>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}

export default SignIn;
