"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  whatsapp: z.string().min(10, "Please enter a valid phone number"),
  destination: z.string().min(1, "Please select a destination"),
  ieltsStatus: z.string().min(1, "Please select your IELTS status"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeadForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      whatsapp: "",
      destination: "",
      ieltsStatus: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Request sent successfully! We will contact you soon.");
      
      // WhatsApp Deep Link
      const msg = `Hi, I'm ${data.fullName}. I'm interested in studying in ${data.destination}. My IELTS status is: ${data.ieltsStatus}.`;
      window.open(`https://wa.me/9779851315991?text=${encodeURIComponent(msg)}`, '_blank');
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <Input 
          {...register("fullName")} 
          placeholder="John Doe" 
          className={errors.fullName ? "border-red-500" : ""}
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
        <Input 
          {...register("whatsapp")} 
          placeholder="+977 9800000000" 
          className={errors.whatsapp ? "border-red-500" : ""}
        />
        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Destination *</label>
        <Select onValueChange={(val: string | null) => { if (val) setValue("destination", val); }}>
          <SelectTrigger className={errors.destination ? "border-red-500" : ""}>
            <SelectValue placeholder="Select Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
            <SelectItem value="USA">USA</SelectItem>
            <SelectItem value="New Zealand">New Zealand</SelectItem>
            <SelectItem value="South Korea">South Korea</SelectItem>
            <SelectItem value="Ireland">Ireland</SelectItem>
            <SelectItem value="Italy">Italy</SelectItem>
            <SelectItem value="Not sure">Not sure</SelectItem>
          </SelectContent>
        </Select>
        {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">IELTS Status *</label>
        <Select onValueChange={(val: string | null) => { if (val) setValue("ieltsStatus", val); }}>
          <SelectTrigger className={errors.ieltsStatus ? "border-red-500" : ""}>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Completed 6.5+">Completed 6.5+</SelectItem>
            <SelectItem value="Completed 6.0">Completed 6.0</SelectItem>
            <SelectItem value="Completed 5.5 or below">Completed 5.5 or below</SelectItem>
            <SelectItem value="Currently preparing">Currently preparing</SelectItem>
            <SelectItem value="Not started">Not started</SelectItem>
          </SelectContent>
        </Select>
        {errors.ieltsStatus && <p className="text-red-500 text-xs mt-1">{errors.ieltsStatus.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-brand text-white hover:bg-brand-dark py-6 text-base font-bold rounded-lg mt-4 shadow-sm hover:-translate-y-0.5 transition-all">
        {isSubmitting ? "Sending..." : "Send my free profile review →"}
      </Button>
    </form>
  );
}
