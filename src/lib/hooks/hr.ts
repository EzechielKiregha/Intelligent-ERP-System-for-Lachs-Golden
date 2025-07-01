import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosdb from '@/lib/axios'
import toast from 'react-hot-toast'

export function useHRSummary() {
  return useQuery({
    queryKey: ['hr', 'summary'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/hr/summary')
      return data as {
        totalEmployees: number
        departmentCount: number
        pendingTasks: number
        documentCount: number
        totalPayrollThisMonth: number
      }
    },
  })
}
interface Emp {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  jobTitle: string,
  department: { name: string },
  createdAt: string,
}
// Preview recent employees
export function useHREmployeesPreview() {
  return useQuery({
    queryKey: ['recent-employees'],
    queryFn: async () => {
      const { data } = await axiosdb.get<Emp[]>('/api/hr/preview/employees')
      return data
    }
  })
}

interface Task {
  id: string,
  title: string,
  description: string,
  dueDate: string,
  assignee: {
    firstName: string,
    lastName: string,
  },
  createdAt: string,
}

// Tasks preview
export function useHRPendingTasksPreview() {
  return useQuery({
    queryKey: ['hr-pending-tasks'],
    queryFn: async () => {
      const { data } = await axiosdb.get<Task[]>('/api/hr/preview/tasks')
      return data
    }
  })
}

interface Review {
  id: string,
  reviewDate: string,
  rating: string,
  comments: string,
  employee: {
      firstName: string,
      lastName: string,
  },
  reviewer: {
      name: string,
      email: string,
  },
}

// Performance reviews preview
export function useHRRecentReviewsPreview() {
  return useQuery({
    queryKey: ['hr-recent-reviews'],
    queryFn: async () => {
      const { data } = await axiosdb.get<Review[]>('/api/hr/preview/reviews')
      return data
    }
  })
}

// 1. Fetch all employees
export function useEmployees() {
  return useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/hr/employees')
      return data as any[]
    },
  })
}

// 2. Fetch single employee (only runs if id is truthy)
export function useSingleEmployee(id?: string) {
  return useQuery({
    queryKey: ['hr', 'employee', id],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/hr/employees/${id}`)
      return data as any
    },
    enabled: Boolean(id),
  })
}

// 3. Create or update employee
export function useSaveEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (emp: any) => {
      if (emp.id) {
        const { data } = await axiosdb.put(`/api/hr/employees/${emp.id}`, emp)
        return data
      } else {
        const { data } = await axiosdb.post('/api/hr/employees', emp)
        return data
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey:['hr', 'employees'],
      })
      qc.invalidateQueries({
        queryKey:['hr', 'employee'],
      })
      
    },
  })
}

// 4. Delete employee
export function useDeleteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosdb.delete(`/api/hr/employees/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey : ['hr', 'employees']
      })
    },
  })
}

// DEPARTMENTS HOOKS
interface Dept { id: string; name: string; employeeCount: number, description?: string }

export function useDepartments() {
  return useQuery({
    queryKey: ['hr', 'departments'],
    queryFn: async () => {
      const { data } = await axiosdb.get<Dept[]>('/api/hr/departments')
      return data
    },
  })
}

export function useSaveDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dept: { id?: string; name: string, desc?: string }) => {
      if (dept.id) {
        const { data } = await axiosdb.put(`/api/hr/departments/${dept.id}`, { name: dept.name, description : dept.desc })
        return data
      } else {
        const { data } = await axiosdb.post('/api/hr/departments', { name: dept.name, description : dept.desc })
        return data
      }
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey : ['hr', 'departments']
    }),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosdb.delete(`/api/hr/departments/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey : ['hr', 'departments']
    }),
  })
}

// PAYROLL HOOKS

interface Payroll {
  id: string
  employeeId: string
  payPeriod: string | null
  grossAmount: number
  taxAmount: number | null
  netAmount: number | null
  issuedDate: string | null
  notes: string | null
  employee: { firstName: string; lastName: string }
}
export function usePayrolls() {
  return useQuery({
    queryKey: ['hr', 'payrolls'],
    queryFn: async () => {
      const { data } = await axiosdb.get<Payroll[]>('/api/hr/payroll')
      return data
    },
  })
}

export function useSinglePayroll(id?: string) {
  return useQuery({
    queryKey: ['hr', 'payroll', id],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/hr/payroll/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

export function useSavePayroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: any) => {
      if (p.id) {
        const { data } = await axiosdb.put(`/api/hr/payroll/${p.id}`, p)
        return data
      } else {
        const { data } = await axiosdb.post('/api/hr/payroll', p)
        return data
      }
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey : ['hr', 'payrolls']
    }),
  })
}

export function useDeletePayroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosdb.delete(`/api/hr/payroll/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['hr', 'payrolls']
    }),
  })
}

// PERFORMANCE REVIEW
export function useReviews(employeeId?: string) {
  return useQuery({
    queryKey: ['hr','reviews',employeeId],
    queryFn: async () => {
      const url = employeeId
        ? `/api/hr/employees/${employeeId}/reviews`
        : '/api/hr/reviews'
      const { data } = await axiosdb.get(url)
      return data as Array<{
        id: string
        reviewDate: string
        rating: 'EXCEEDS'|'MEETS'|'NEEDS_IMPROVEMENT'
        comments: string
        reviewer?: { name: string }
        employee?: { firstName:string; lastName:string }
      }>
    },
    enabled: employeeId !== undefined ? true : true,
  })
}

export function useSaveReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rev: any) => {
      if (rev.id) {
        const { data } = await axiosdb.put(`/api/hr/reviews/${rev.id}`, rev)
        return data
      } else {
        const { data } = await axiosdb.post('/api/hr/reviews', rev)
        return data
      }
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey:['hr','reviews']
    }),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosdb.delete(`/api/hr/reviews/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['hr','reviews']
    }),
  })
}

// TASK HOOKS
export function useTasks() {
  return useQuery({
    queryKey: ['hr','tasks'],
    queryFn: async () => (await axiosdb.get('/api/hr/tasks')).data,
  })
}

export function useSingleTask(id?: string) {
  return useQuery({
    queryKey: ['hr','task',id],
    enabled: Boolean(id),
    queryFn: async () => (await axiosdb.get(`/api/hr/tasks/${id}`)).data,
  })
}

export function useSaveTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (t:any) => t.id
      ? (await axiosdb.put(`/api/hr/tasks/${t.id}`, t)).data
      : (await axiosdb.post('/api/hr/tasks', t)).data,
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['hr','tasks']
    }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id:string) => axiosdb.delete(`/api/hr/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['hr','tasks']
    }),
  })
}

// DOCUMENT HOOKS
export function useDocuments() {
  return useQuery({
    queryKey: ['hr','documents'],
    queryFn: async () => (await axiosdb.get('/api/hr/documents')).data,
  })
}

export function useSingleDocument(id?: string) {
  return useQuery({
    queryKey: ['hr','document',id],
    enabled: Boolean(id),
    queryFn: async () => (await axiosdb.get(`/api/hr/documents/${id}`)).data,
  })
}

export function useSaveDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d:any) => d.id
      ? (await axiosdb.put(`/api/hr/documents/${d.id}`, d)).data
      : (await axiosdb.post('/api/hr/documents', d)).data,
    onSuccess: () => qc.invalidateQueries({
      queryKey : ['hr','documents']
    }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id:string) => axiosdb.delete(`/api/hr/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({
      queryKey : ['hr','documents']
    }),
  })
}