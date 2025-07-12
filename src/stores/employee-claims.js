import { defineStore } from 'pinia'

export const useClaimStore = defineStore('claimStore', {
  state: () => ({
    errors: {},
    user: null,
    groupedClaims: { pending: [], approved: [], rejected: [] },
    groupedClaimsLoading: false,
    groupedClaimsError: null,
  }),

  actions: {
    // ✅ Create A Claim
    async createClaim(formData) {
      const plainData = JSON.parse(JSON.stringify(formData)) // 💥 fixes reactive issues

      const form = new FormData()
      form.append('name', plainData.name)
      form.append('department', plainData.department)
      form.append('relation', plainData.relation)
      form.append('description', JSON.stringify(plainData.description))
      form.append('amount', plainData.amount)
      form.append('document', formData.document) // file is safe directly
      const baseURL = import.meta.env.VITE_API_URL

      const res = await fetch(`${baseURL}/api/post`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          // ❌ DO NOT set Content-Type here (FormData handles it)
        },
        body: form,
      })

      const data = await res.json()

      if (!res.ok) {
        this.errors = data.errors || { general: ['Something went wrong'] }
      } else {
        this.errors = {}
        console.log('✅ Claim created:', data)
      }
    },

    //!! ✅ Fetch all claims for the authenticated user
    async fetchMyClaims() {
      const baseURL = import.meta.env.VITE_API_URL

      const res = await fetch(`${baseURL}/api/my-posts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        this.errors = data.errors || { general: ['Failed to fetch claims'] }
        return []
      } else {
        this.errors = {}
        return data.data
      }
    },
    //!! ✅ Fetch all claims from user to Supervisor
    async fetchSupervisorClaims() {
      const baseURL = import.meta.env.VITE_API_URL

      const res = await fetch(`${baseURL}/api/supervisor/all-claims`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        this.errors = data.errors || { general: ['Failed to fetch claims'] }
        return []
      } else {
        this.errors = {}
        return data.data
      }
    },
    //!! ✅ Fetch all claims from user to Manager
    async fetchManagerClaims() {
      const baseURL = import.meta.env.VITE_API_URL

      const res = await fetch(`${baseURL}/api/manager/all-claims`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        this.errors = data.errors || { general: ['Failed to fetch claims'] }
        return []
      } else {
        this.errors = {}
        return data.data
      }
    },
    //!! ✅ Fetch all claims from user to HR
    async fetchHrClaims() {
      const baseURL = import.meta.env.VITE_API_URL

      const res = await fetch(`${baseURL}/api/hr/all-claims`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        this.errors = data.errors || { general: ['Failed to fetch claims'] }
        return []
      } else {
        this.errors = {}
        return data.data
      }
    },
    //!! ✅ Fetch all claims from user to Account
    async fetchAccountClaims() {
      const baseURL = import.meta.env.VITE_API_URL

      const res = await fetch(`${baseURL}/api/account/all-claims`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        this.errors = data.errors || { general: ['Failed to fetch claims'] }
        return []
      } else {
        this.errors = {}
        return data.data
      }
    },

    //!! APPROVE CLAIM
    async approveClaim(claimId) {
      const baseURL = import.meta.env.VITE_API_URL

      this.errors = {}
      const token = localStorage.getItem('token')
      const res = await fetch(`${baseURL}/api/claims/${claimId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        this.errors = data.errors || { general: ['Failed to approve claim.'] }
      } else {
        // Removed buggy claims array mutation as requested
      }
      return data
    },

    async rejectClaim(claimId, reason) {
      const baseURL = import.meta.env.VITE_API_URL

      this.errors = {}
      const token = localStorage.getItem('token')
      await fetch(`${baseURL}/api/claims/${claimId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reason),
      })
    },

    //!!FETCH MY HANDLED CLAIMS
    async fetchMyHandledClaims() {
      const baseURL = import.meta.env.VITE_API_URL

      this.errors = {}
      const token = localStorage.getItem('token')
      const res = await fetch(`${baseURL}/api/my-handled-claims`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      // Store in Pinia state as needed
      if (!res.ok) {
        console.log(data.errors)
        return (this.errors = data.errors)
      }
      console.log(data.data)
      return data.data
    },

    //!! FETCH GROUPED CLAIMS FOR USER
    async fetchMyClaimsGrouped() {
      const baseURL = import.meta.env.VITE_API_URL
      this.groupedClaimsLoading = true
      this.groupedClaimsError = null
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${baseURL}/api/my-claims-grouped`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          this.groupedClaims = data.data
          return data.data // for immediate use in components
        } else {
          this.groupedClaims = { pending: [], approved: [], rejected: [] }
          this.groupedClaimsError = data.message || 'Failed to fetch claims'
          return this.groupedClaims
        }
      } catch (e) {
        console.log(e)
        this.groupedClaims = { pending: [], approved: [], rejected: [] }
        this.groupedClaimsError = 'Failed to fetch claims'
        return this.groupedClaims
      } finally {
        this.groupedClaimsLoading = false
      }
    },
  },
})
