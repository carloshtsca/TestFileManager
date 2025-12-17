import { Link, useNavigate } from "react-router-dom"
import { Box } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormLabel, Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Field, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner";

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuthStore } from "@/store/authStore";
import { loginSchema, type LoginFormValues } from "@/schemas/login"
import { useEffect } from "react"

export default function LoginScreen() {
    const { login: loginUser, logout } = useAuthStore();

    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            const response = await loginUser(values);
            toast.success(response.message);
            navigate('/', { state: { justAuthenticated: true } });
            form.reset();
        } catch (err: any) {
            if (err.message === 'Server unavailable. Check your connection.') {
                toast.warning(err.message);
            } else {
                toast.error(err.message);
            }
        }
    };

    useEffect(() => {
        logout();
    }, []);

    return (
        <div className="h-screen grid place-items-center">
            <div className="w-full h-full sm:w-110 sm:h-max py-6 px-7 bg-accent sm:rounded-md shadow-xl border">
                <div className="flex flex-col items-center justify-center gap-2 mb-8">
                    <div className="flex items-center gap-2">
                        <Box color="#077DFE" />
                        <h1 className="font-extrabold text-2xl">Login</h1>
                    </div>
                    <p className="text-md">
                        Don't have an account?{" "}
                        <Link to="/auth/register" className="hover:underline">
                            Register
                        </Link>
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="email" className='text-sm'>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Enter email" {...field} id="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="password" className='text-sm'>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter password" {...field} id="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full mt-2 cursor-pointer" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Spinner /> : "Login"}
                        </Button>

                        <div className="mt-1 flex justify-center">
                            <Field orientation="horizontal" className="w-full flex items-center justify-center">
                                <FieldDescription className="text-center text-sm w-[80%]">
                                    By clicking continue, you agree to our Terms of Service and Privacy Policy.
                                </FieldDescription>
                            </Field>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}


