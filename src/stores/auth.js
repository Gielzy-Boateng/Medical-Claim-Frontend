import { defineStore } from 'pinia'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    errors: {},
    user: null,
  }),

  actions: {
    //?? getAuthenticated User
    async getAuthUser() {
      if (localStorage.getItem('token')) {
        const res = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })
        const data = await res.json()
        if (res.ok) {
          this.user = data
        }
        console.log(data)
      }
    },

    async authenticate(apiRoute, formData, router) {
      const res = await fetch(`/api/${apiRoute}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.errors) {
        this.errors = data.errors
        return // Stop further logic
      }

      if (!data.user || !data.token) {
        this.errors = {
          email: ['Login failed. Please check your credentials.'],
        }
        return
      }

      // ✅ Success: save token and user
      localStorage.setItem('token', data.token)
      this.errors = {}
      this.user = data.user

      // ✅ Redirect based on role - users are now automatically employees
      if (this.user.role) {
        console.log('Redirecting to:', `/${this.user.role}/dashboard`)
        router.push(`/${this.user.role}/dashboard`)
      } else {
        // If no role is set, redirect to role page (which now just shows info)
        console.log('No role set, redirecting to setRole')
        router.push({ name: 'setRole' })
      }

      console.log(data)
    },

    //!!LOGOUT USER
    async logout(router) {
      const res = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()
      console.log(data)

      if (res.ok) {
        this.user = null
        this.errors = {}
        localStorage.removeItem('token')
        router.push({ name: 'home' })
      } else {
        this.errors = data.errors
      }
    },

    //!! HR Role Management Functions
    async assignRoleToUser(userId, role) {
      const res = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, role: role }),
      })

      const data = await res.json()

      if (!res.ok) {
        this.errors = data.errors || { general: [data.message || 'Failed to assign role'] }
        return null
      } else {
        this.errors = {}
        return data.user
      }
    },
  },
})
