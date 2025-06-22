import Settings from "~/components/settings";

export function meta() {
  return [
    { title: "Settings" },
    { name: "description", content: "Settings" },
  ];
}

export default function Page() {
  return <Settings />;
}

