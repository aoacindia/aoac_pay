import Image from "next/image";

type PaymentLoadingProps = {
  message: string;
};

export function PaymentLoading({ message }: PaymentLoadingProps) {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[50vh] sm:py-16">
      <Image
        src="/logo/logo.png"
        alt="AOAC"
        width={120}
        height={48}
        priority
        className="h-auto w-20 object-contain sm:w-24"
      />
      <h1 className="mt-4 text-base font-semibold tracking-tight text-[#168e2d] sm:mt-5 sm:text-lg">
        AOAC payments
      </h1>
      <div className="mt-6 flex items-center gap-2.5 sm:mt-8 sm:gap-3">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#168e2d]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#168e2d] [animation-delay:150ms]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#168e2d] [animation-delay:300ms]" />
      </div>
      <p className="mt-5 max-w-[280px] px-2 text-sm leading-relaxed text-[#2d5a36] sm:mt-6 sm:max-w-xs">
        {message}
      </p>
    </div>
  );
}
