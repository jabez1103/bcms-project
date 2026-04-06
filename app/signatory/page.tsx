import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/signatory/home"); // automatically goes to the proper URL
}