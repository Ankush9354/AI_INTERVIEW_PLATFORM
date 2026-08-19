import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import { Link } from "react-router-dom";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../components/ui/Button";
import AuthInput from "../components/auth/AuthInput";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

import {
  signupSchema,
  type SignupFormData,
} from "../validation/authSchema";

const Signup = () => {
  // Hooks

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

const onSubmit = async (data: SignupFormData) => {
  setLoading(true);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: data.name,
      email: data.email,
      createdAt: serverTimestamp(),
    });

    console.log("User created successfully");
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  return (
    <AuthLayout>
      <AuthCard>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Create Account 🚀
          </h1>

          <p className="mt-2 text-slate-500">
            Join AI Interview Platform
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            registration={register("name")}
            error={errors.name}
          />

          <AuthInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            registration={register("email")}
            error={errors.email}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            registration={register("password")}
            error={errors.password}
          />

          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;