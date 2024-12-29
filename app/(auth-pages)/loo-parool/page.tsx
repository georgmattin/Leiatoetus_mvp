import SetPasswordForm from "@/components/user_auth_components/set-password"
import Header from "@/components/header"
import MobileHeader from "@/components/mobileheader"

export default function SetPasswordPage() {
  return (
    <>
      <Header />
      <MobileHeader />
      <main className="min-h-screen bg-[#F6F9FC] py-16 px-4">
        <SetPasswordForm />
      </main>
    </>
  )
} 