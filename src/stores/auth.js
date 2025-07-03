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

    async authenticate(apiRoute, formData, role, router) {
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

      // ✅ Redirect based on role
      if (this.user.role) {
        router.push(`/${this.user.role}/dashboard`)
      } else {
        router.push({ name: 'setRole' }) // usually 'setRole'
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
  },
})
