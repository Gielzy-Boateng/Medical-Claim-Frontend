import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import SetRole from '@/views/SetRole.vue'
import EmployeeView from '@/views/users/EmployeeView.vue'
import AccountView from '@/views/users/AccountView.vue'
import HrView from '@/views/users/HrView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import SupervisorView from '@/views/users/SupervisorView.vue'
import ManagerView from '@/views/users/ManagerView.vue'
import { useAuthStore } from '@/stores/auth'
import EmployeeClaim from '@/views/EmployeeClaim.vue'
import SuperVisorClaimDetailsView from '@/views/users/SuperVisorClaimDetailsView.vue'
import ManagerClaimDetailsView from '@/views/users/ManagerClaimDetailsView.vue'
import HrClaimDetailsView from '@/views/users/HrClaimDetailsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        guest: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        guest: true,
      },
    },
    {
      path: '/set-role',
      name: 'setRole',
      component: SetRole,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/hr/dashboard',
      name: 'hr',
      component: HrView,
      meta: {
        requiresAuth: true,
        role: 'hr',
      },
    },
    {
      path: '/employee/dashboard',
      name: 'employee',
      component: EmployeeView,
      meta: {
        requiresAuth: true,
        role: 'employee',
      },
    },
    {
      path: '/supervisor/dashboard',
      name: 'supervisor',
      component: SupervisorView,
      meta: {
        requiresAuth: true,
        role: 'supervisor',
      },
    },
    {
      path: '/supervisor/claims/:id',
      name: 'supervisorClaimView',
      component: SuperVisorClaimDetailsView,
      meta: {
        requiresAuth: true,
        role: 'supervisor',
      },
    },
    {
      path: '/manager/claims/:id',
      name: 'managerClaimView',
      component: ManagerClaimDetailsView,
      meta: {
        requiresAuth: true,
        role: 'manager',
      },
    },
    {
      path: '/hr/claims/:id',
      name: 'hrClaimView',
      component: HrClaimDetailsView,
      meta: {
        requiresAuth: true,
        role: 'hr',
      },
    },
    {
      path: '/manager/dashboard',
      name: 'manger',
      component: ManagerView,
      meta: {
        requiresAuth: true,
        role: 'manager',
      },
    },
    {
      path: '/account/dashboard',
      name: 'account',
      component: AccountView,
      meta: {
        requiresAuth: true,
        role: 'account',
      },
    },
    {
      path: '/employee/claim/create',
      name: 'claim',
      component: EmployeeClaim,
      meta: {
        requiresAuth: true,
        role: 'employee',
      },
    },
    // {
    //   path: '/login',
    //   name: 'login',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && localStorage.getItem('token')) {
    await authStore.getAuthUser()
  }

  const isLoggedIn = !!authStore.user
  const requiresAuth = to.meta.requiresAuth
  const guestOnly = to.meta.guest
  const requiredRole = to.meta.role

  // 🚦 Redirect logged-in user from home to their dashboard
  if (isLoggedIn && to.name === 'home' && authStore.user?.role) {
    return next({ name: authStore.user.role })
  }

  //!! 🔐 Route requires login
  if (requiresAuth && !isLoggedIn) {
    if (to.name !== 'login') {
      return next({ name: 'login' })
    } else {
      return next() // !!don't redirect again to the same login page
    }
  }

  //?? 👤 Route is for guests only, but user is logged in
  if (guestOnly && isLoggedIn) {
    if (to.name !== authStore.user.role) {
      return next({ name: authStore.user.role }) // role should match route name
    } else {
      return next() // already on correct page
    }
  }

  //!!  Route requires specific role
  if (requiredRole && authStore.user?.role !== requiredRole) {
    // Prevent infinite redirect loop: only redirect if not already on user's dashboard
    if (to.name !== authStore.user.role) {
      return next({ name: authStore.user.role }) // redirect to correct dashboard
    } else {
      return next(false) // already on correct dashboard, abort further navigation
    }
  }

  //!! ✅ No redirection needed
  next()
})

export default router
