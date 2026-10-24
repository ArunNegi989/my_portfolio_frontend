import NotFoundContent from "@/components/public/NotFoundContent";

// Rendered inside the public layout when a public page calls notFound() (unknown project or article slug).
export default function PublicNotFound() {
  return <NotFoundContent />;
}
