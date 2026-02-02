// import Logo from '../../../public/header_button.svg';

export default function Footer() {
  return (
    <footer className="flex flex-col gap-4 py-7 px-6 bg-muted border-b border-border sm:flex-row sm:items-center sm:justify-between sm:px-9">
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
        <img
          alt="Travel-planner-logo"
          src="/header_button.svg"
          className="h-8 w-auto"
        />
        <p className="text-sm text-muted-foreground">
          2026 Travel Planner SaS - © all rights reserved
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:gap-6">
        <a href="/rgpd/condition" className="hover:underline">
          Terms and conditions
        </a>
        <a href="/rgpd/privacy" className="hover:underline">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}