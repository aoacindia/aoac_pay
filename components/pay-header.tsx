import Image from "next/image";

type PayHeaderProps = {
  subtitle?: string;
};

export function PayHeader({ subtitle = "Complete your order" }: PayHeaderProps) {
  return (
    <header className="mb-5 flex flex-col items-center px-1 text-center sm:mb-6 md:mb-8">
      <Image
        src="/logo/logo.png"
        alt="AOAC"
        width={100}
        height={40}
        priority
        className="h-auto w-16 object-contain sm:w-20"
      />
      <h1 className="mt-3 text-lg font-semibold tracking-tight text-[#168e2d] sm:mt-4 sm:text-xl">
        AOAC payments
      </h1>
      {subtitle ? (
        <p className="mt-1 max-w-sm text-xs text-[#4a9f5c] sm:text-sm">{subtitle}</p>
      ) : null}
    </header>
  );
}
