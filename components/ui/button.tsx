import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const variants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:opacity-50", { variants: { variant: { default: "bg-brand text-navy shadow-sm hover:bg-orange-400", secondary: "bg-slate-100 text-navy hover:bg-slate-200", outline: "border border-slate-300 bg-white text-navy hover:border-brand hover:bg-orange-50", danger: "bg-red-600 text-white hover:bg-red-700" } }, defaultVariants: { variant: "default" } });
export function Button({ className, variant, asChild, ...props }: React.ComponentProps<"button"> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  return <Component className={twMerge(clsx(variants({ variant }), className))} {...props} />;
}
