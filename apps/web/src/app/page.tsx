// import { }

export default function Home() {

//   const users = [];
  return (
    <div className="flex h-full flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🌍 Travel Planner</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Plan your perfect trip with friends
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}
