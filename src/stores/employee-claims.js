import { defineStore } from 'pinia'

export const useClaimStore = defineStore('claimStore', {
  state: () => ({
    errors: {},
    user: null,
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

      const res = await fetch('/api/post', {
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
      const res = await fetch('/api/my-posts', {
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
      const res = await fetch('/api/supervisor/all-claims', {
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
      const res = await fetch('/api/manager/all-claims', {
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
      const res = await fetch('/api/hr/all-claims', {
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
      this.errors = {}
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/claims/${claimId}/approve`, {
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
      this.errors = {}
      const token = localStorage.getItem('token')
      await fetch(`/api/claims/${claimId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reason),
      })
    },

    async fetchMyHandledClaims() {
      this.errors = {}
      const token = localStorage.getItem('token')
      const res = await fetch('/api/my-handled-claims', {
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
  },
})
