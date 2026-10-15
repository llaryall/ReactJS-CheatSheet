import { redirect } from "next/navigation";

export default async function LegacyTopicPage({ params }) {
  const { slug } = await params;
  redirect(`/en/topic/${encodeURIComponent(slug)}`);
}
