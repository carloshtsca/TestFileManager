import { Link, useNavigate } from "react-router-dom"
import { Box } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormLabel, Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Field, FieldDescription } from "@/components/ui/field"
import { PhoneInput } from "@/components/shared/phone-input"
import { Spinner } from "@/components/ui/spinner";

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormValues } from "@/schemas/register"

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react"

export default function RegisterScreen() {
    const { register: registerUser, logout } = useAuthStore();

    const navigate = useNavigate();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            country: "BR",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            const response = await registerUser(values);
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
            <div className="w-full h-full sm:w-150 sm:h-max py-6 px-7 bg-accent sm:rounded-md shadow-xl border">
                <div className="flex flex-col items-center justify-center gap-2 mb-8">
                    <div className="flex items-center gap-2">
                        <Box color="#077DFE" />
                        <h1 className="font-extrabold text-2xl">Sign Up</h1>
                    </div>
                    <p className="text-md">
                        Don't have an account?{" "}
                        <Link to="/auth/login" className="hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
                        {/* First Name */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="firstname" className='text-sm se'>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter first name" {...field} id="firstname" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Last Name */}
                            <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="lastname" className='text-sm'>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter last name" {...field} id="lastname" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

                            {/* Phone */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="phone" className='text-sm'>Phone</FormLabel>
                                        <FormControl>
                                            <PhoneInput
                                                {...field}
                                                international
                                                // defaultCountry="BR"
                                                placeholder="Enter phone number"
                                                onCountryChange={(country) => {
                                                    form.setValue("country", country);  // atualiza country
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="confirmpassword" className='text-sm'>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Confirm password"
                                            {...field}
                                            id="confirmpassword"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full mt-2 cursor-pointer" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Spinner /> : "Register"}
                        </Button>

                        <div className="mt-1 flex justify-center">
                            <Field orientation="horizontal" className="w-full flex items-center justify-center">
                                <FieldDescription className="text-center text-sm w-[60%]">
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


