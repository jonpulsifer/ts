import Dashboard from "~/components/dashboard";

export function meta() {
  return [
    { title: "Weather Hub - Tempest Dashboard" },
    { name: "description", content: "Real-time weather data from WeatherFlow Tempest station" },
    { name: "viewport", content: "width=device-width, initial-scale=1, user-scalable=no" },
  ];
}

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Dashboard />
    </div>
  );
}

