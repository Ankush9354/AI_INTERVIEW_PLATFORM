import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import Button from "../components/ui/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

import {
  loginSchema,
  type LoginFormData,
} from "../validation/authSchema";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
  setLoading(true);

  try {
    await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    navigate("/dashboard");
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthLayout>
      <AuthCard>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="mt-2 text-slate-500">
            Login to continue
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >

          <AuthInput
            label="Email"
            type="email"
            placeholder="Enter email"
            registration={register("email")}
            error={errors.email}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter password"
            registration={register("password")}
            error={errors.password}
          />

          <Button
           type="submit"
           className="w-full"
           disabled={loading}
            >
             {loading ? "Logging in..." : "Login"}
           </Button>

        </form>

        <p className="mt-6 text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600"
          >
            Sign Up
          </Link>
        </p>

      </AuthCard>
    </AuthLayout>
  );
};

export default Login;