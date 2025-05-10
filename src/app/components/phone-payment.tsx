"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Loader2 } from "lucide-react"

interface PhonePaymentProps {
  required: boolean
  amount: number
}

export function PhonePayment({ required, amount }: PhonePaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"phone" | "verification">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call to send verification code
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep("verification")
    } catch (error) {
      setError("Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError("Please enter a valid verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call to verify code
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsVerified(true)
    } catch (error) {
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <Alert className="bg-green-50 border-green-500">
        <Check className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Phone payment method verified. ${amount.toFixed(2)} will be charged to your phone bill upon order completion.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "phone" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="(123) 456-7890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required={required}
            />
            <p className="text-sm text-gray-500">
              We'll send a verification code to this number. Standard message rates may apply.
            </p>
          </div>
          <Button type="button" onClick={handleSendCode} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Code
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="1234"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required={required}
            />
            <p className="text-sm text-gray-500">
              Enter the 4-digit code sent to {phoneNumber}.{" "}
              <button type="button" onClick={() => setStep("phone")} className="text-primary hover:underline">
                Change number
              </button>
            </p>
          </div>
          <Button type="button" onClick={handleVerifyCode} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
              </>
            ) : (
              "Verify Code"
            )}
          </Button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>
          By continuing, you agree to pay ${amount.toFixed(2)} through your mobile carrier. This charge will appear on
          your next phone bill.
        </p>
      </div>
    </div>
  )
}
