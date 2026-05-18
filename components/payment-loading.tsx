import Image from "next/image";

type PaymentLoadingProps = {
  message: string;
};

export function PaymentLoading({ message }: PaymentLoadingProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Image
        src="/logo/logo.png"
        alt="AOAC"
        width={120}
        height={48}
        priority
        className="h-auto w-24 object-contain"
      />
      <h1 className="mt-5 text-lg font-semibold tracking-tight text-[#168e2d]">
        AOAC payments
      </h1>
      <div className="mt-8 flex items-center gap-3">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#168e2d]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#168e2d] [animation-delay:150ms]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#168e2d] [animation-delay:300ms]" />
      </div>
      <p className="mt-6 max-w-xs text-sm text-[#2d5a36] transition-opacity duration-300">
        {message}
      </p>
    </div>
  );
}
