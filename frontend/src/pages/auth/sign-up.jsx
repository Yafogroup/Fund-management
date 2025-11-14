import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography, CardBody,
} from "@material-tailwind/react";
import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import messages from "@/const/msg.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import Helper from "@/helper.jsx";
import authService from "@/api/authService.jsx";


export function SignUp() {

    const navigate = useNavigate();
    const {showNotification} = useNotification();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [agree, setAgree] = useState("");

    const doSignUp = async () => {

        if (email === "" || !Helper.isValidEmail(email)) {
            showNotification(messages.input_email, 'red');
            return;
        }

        if (password === "") {
            showNotification(messages.input_password, 'red');
            return;
        }

        if (password !== passwordConfirm) {
            showNotification(messages.mismatch_password, 'red');
            return;
        }

        const result = await authService.signup(email, password)

        if (result.data.status === 'success') {
            showNotification(result.data.message, 'green');
            navigate("/auth/sign-in");
        } else {
            showNotification(result.data.message, 'red');
        }
    }

    const doSignIn = async () => {
        navigate("/auth/sign-in");
    }

    return (
        <section className="relative min-h-screen">
            <img
                src="/img/bg.png"
                className="h-full w-full object-center absolute"
            />
            <Card className="w-1/2 h-[55%] bg-sidebar mx-auto absolute left-[25%] top-[20%]">
                <CardBody className="p-0">
                    <div className="h-full flex flex-row relative">
                        <img
                            src="/img/logo.png"
                            className="object-contain absolute top-10 left-10"
                        />
                        <img
                            src="/img/bg_login.jpg"
                            className="w-[55%] object-cover rounded-l-lg mb-10"
                        />
                        <div className="flex-1">
                            <div className="text-center mt-14">
                                <Typography className="text-gray-600 text-[25px]">Welcome to YAFO</Typography>
                            </div>
                            <form className="mt-8 mx-auto max-w-screen-lg lg:w-3/4">
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
                                        />
                                    </div>
                                    <div className="bg-cBlue3 rounded-lg px-2">
                                        <Input
                                            placeholder="Password confirm"
                                            type="password"
                                            size="lg"
                                            className="border-none text-gray-300 text-[16px]"
                                            value={passwordConfirm}
                                            onChange={(e) => setPasswordConfirm(e.target.value)}
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
                                </div>
                                <Button className="mt-6 bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce] text-[15px] font-normal" fullWidth onClick={doSignUp}>
                                    Register Now
                                </Button>

                                <div className="flex items-center justify-center w-full my-4">
                                    <div className="flex-grow border-t border-gray-700"></div>
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="mx-3 text-sm text-gray-400"
                                    >
                                        Already have an account ?
                                    </Typography>
                                    <div className="flex-grow border-t border-gray-700"></div>
                                </div>
                                <Button className="mt-6 bg-transparent border-[1px] border-gray-500 text-[15px] font-normal" fullWidth onClick={doSignIn}>
                                    Sign In
                                </Button>
                            </form>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </section>
    );
}

export default SignUp;
