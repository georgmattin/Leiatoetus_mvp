import RegisterForm from "@/components/user_auth_components/register"
import Header from "@/components/header"
import MobileHeader from "@/components/mobileheader"

export default function RegisterPage() {
  return (
    <>
      <Header />
      <MobileHeader />
      <main className="min-h-screen bg-[#F6F9FC] py-16 px-4">
        <RegisterForm />
      </main>
    </>
  )
}
