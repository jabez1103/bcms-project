import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/home"); // automatically goes to the proper URL
}