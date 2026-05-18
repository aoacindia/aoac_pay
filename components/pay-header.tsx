import Image from "next/image";

type PayHeaderProps = {
  subtitle?: string;
};

export function PayHeader({ subtitle = "Complete your order" }: PayHeaderProps) {
  return (
    <header className="mb-8 flex flex-col items-center text-center">
      <Image
        src="/logo/logo.png"
        alt="AOAC"
        width={100}
        height={40}
        priority
        className="h-auto w-20 object-contain"
      />
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-[#168e2d]">
        AOAC payments
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-[#4a9f5c]">{subtitle}</p>
      ) : null}
    </header>
  );
}
