import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/student/home"); // automatically goes to the proper URL
}