import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { PhoneInput } from "@/components/shared/phone-input";

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userSchema, type UserFormValues } from "@/schemas/user";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

import { format, parseISO } from "date-fns";
import { Fullscreen, RefreshCw, Replace, Trash2 } from "lucide-react";

export default function Account() {
    const user = useAuthStore(state => state.user);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            avatar: user?.avatar || null,
            firstname: user?.firstname || "",
            lastname: user?.lastname || "",
            email: user?.email || "",
            phone: user?.phone || "",
        },
    });

    const onSubmit = async (values: UserFormValues) => {
        try {
            console.log(values);
            form.reset();
        } catch (err: any) {
            if (err.message === 'Server unavailable. Check your connection.') {
                toast.warning(err.message);
            } else {
                toast.error(err.message);
            }
        }
    };

    return (
        <Sheet onOpenChange={(open) => { if (!open) form.reset(); }}>
            <SheetTrigger asChild>
                <Avatar className='size-10 cursor-pointer'>
                    <AvatarImage src="https://github.com/shadcn.p" />
                    <AvatarFallback>{user!.firstname.split('', 1)}{user!.lastname.split('', 1)}</AvatarFallback>
                </Avatar>
            </SheetTrigger>
            <SheetContent className="!w-full sm:!max-w-[600px]">
                <SheetHeader>
                    <SheetTitle>Profile</SheetTitle>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 px-6">
                        <div className='flex items-center gap-4 px-4 py-3 border rounded-lg'>
                            <Avatar className='size-12'>
                                <AvatarImage src="https://github.com/shadcn.pngs" alt="@shadcn" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>

                            <div className='flex flex-col gap-1'>
                                <div className='flex items-center gap-1'>
                                    <Button type='button' size='sm' variant='ghost'><Fullscreen /> Preview</Button>
                                    <Button type='button' size='sm' variant='ghost'><RefreshCw /> Replace</Button>
                                    <Button type='button' size='sm' variant='ghost'><Trash2 /> Remove</Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 place-content-center-safe gap-x-4 gap-y-5">
                            {/* First Name */}
                            <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="firstname" className='text-sm'>First Name</FormLabel>
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
                        </div>

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
                                            placeholder="Enter phone number"
                                            onCountryChange={(country) => {
                                                form.setValue("country", country);
                                            }}
                                        />
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
                                        <Input disabled type="text" placeholder="Enter email" {...field} id="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Created At */}
                        <FormItem>
                            <FormLabel htmlFor="createdAt" className='text-sm'>Created at</FormLabel>
                            <FormControl>
                                <Input disabled value={format(parseISO(user!.createdAt), "EEEE, dd MMMM yyyy, HH:mm:ss")} id="createdAt" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        {/* Updated At */}
                        <FormItem>
                            <FormLabel htmlFor="updatedAt" className='text-sm'>Updated at</FormLabel>
                            <FormControl>
                                <Input disabled value={format(parseISO(user!.updatedAt), "EEEE, dd MMMM yyyy, HH:mm:ss")} id="updatedAt" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </form>
                </Form>

                <SheetFooter>
                    <Button type="button" className='cursor-pointer' onClick={form.handleSubmit(onSubmit)}>
                        {form.formState.isSubmitting ? <Spinner /> : "Update"}
                    </Button>

                    <SheetClose asChild>
                        <Button variant="outline" className='cursor-pointer'>Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
