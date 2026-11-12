'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { useAuth, useUser } from '@clerk/nextjs'

const POSTHOG_KEY = 'phc_vsRrRc4pCToJfsSdRyQJRTU2sSWqCujvUYNhU6B3k3ho'
const POSTHOG_HOST = 'https://us.i.posthog.com'

export function PostHogInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false, // we do it manually below
      capture_pageleave: true,
    })
  }, [])
  return null
}

export function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview', { $current_url: window.location.href })
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogIdentify() {
  const { userId } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    if (userId && user) {
      posthog.identify(userId, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.firstName,
      })
    } else if (!userId) {
      posthog.reset()
    }
  }, [userId, user])

  return null
}
