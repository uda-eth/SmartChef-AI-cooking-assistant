import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            AI Meal Planner
          </h1>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <a href="/auth/signin">Get Started</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
