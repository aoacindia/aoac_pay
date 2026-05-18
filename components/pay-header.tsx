import Image from "next/image";

export function PayHeader() {
  return (
    <header className="mb-8 flex flex-col items-center text-center">
      <Image
        src="/logo/logo.png"
        alt="Allahabad Organic Agricultural Company"
        width={180}
        height={72}
        priority
        className="h-auto w-44 object-contain sm:w-48"
      />
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-500">
        Secure payment
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        Complete your order
      </h1>
    </header>
  );
}
