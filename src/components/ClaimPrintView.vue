<template>
  <div class="print-container">
    <!-- Logo -->
    <div class="logo-section">
      <img :src="logoSrc" alt="Company Logo" class="logo" v-if="logoSrc" />
      <div v-else class="company-name">COMPANY NAME</div>
    </div>

    <!-- Main Table -->
    <table class="main-table">
      <thead>
        <tr>
          <th :colspan="2" class="form-title">EMPLOYEE MEDICAL EXPENSES CLAIMS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="info-cell">
            Employee Name: <span class="info-value">{{ claim.user?.name || 'N/A' }}</span>
          </td>
          <td class="info-cell">
            Department: <span class="info-value">{{ claim.department || 'N/A' }}</span>
          </td>
        </tr>
        <tr>
          <td class="info-cell">
            Beneficiary Name: <span class="info-value">{{ claim.name || 'N/A' }}</span>
          </td>
          <td class="info-cell">
            Relation: <span class="info-value">{{ claim.relation || 'N/A' }}</span>
          </td>
        </tr>
        <tr>
          <td class="info-cell">
            Claim Date: <span class="info-value">{{ formatDate(claim.created_at) }}</span>
          </td>
          <td class="info-cell">
            Total Amount: <span class="info-value">₵{{ claim.amount || '0.00' }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>Medicine/Service</th>
          <th>Amount (₵)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in parsedDescription" :key="idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td>{{ item.medicine || item.description || 'N/A' }}</td>
          <td class="text-right">₵{{ item.price || item.amount || '0.00' }}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" class="text-right total-label">Total Amount:</td>
          <td class="text-right total-amount">₵{{ claim.amount || '0.00' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Approval Timeline -->
    <div class="approval-section">
      <h3 class="section-title">Approval Timeline</h3>
      <div class="timeline-grid">
        <div class="timeline-item" v-for="(stage, index) in approvalStages" :key="index">
          <div class="stage-name">{{ stage.name }}</div>
          <div class="stage-status" :class="stage.status">
            {{
              stage.status === 'approved'
                ? '✅ Approved'
                : stage.status === 'rejected'
                  ? '❌ Rejected'
                  : stage.status === 'pending'
                    ? '⏳ Pending'
                    : '⏸️ Not Reached'
            }}
          </div>
          <div class="stage-details" v-if="stage.approver">
            By: {{ stage.approver }}<br />
            <span v-if="stage.date">{{ formatDate(stage.date) }}</span>
            <span v-if="stage.reason" class="rejection-reason">Reason: {{ stage.reason }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Signature Section: Two Columns -->
    <div class="signature-section-2col">
      <div class="sig-col">
        <div class="sig-field">
          <span class="sig-label">Employee's Signature:</span>
        </div>
        <div class="sig-underline-dashed"></div>
        <div class="sig-field mt-6">
          <span class="sig-label">Date:</span>
        </div>
        <div class="sig-underline-dashed"></div>
      </div>
      <div class="sig-col">
        <div class="sig-field">
          <span class="sig-label">Finance Dept. Signature:</span>
        </div>
        <div class="sig-underline-dashed"></div>
        <div class="sig-field mt-6">
          <span class="sig-label">Finance Officer Name:</span>
        </div>
        <div class="sig-underline-dashed"></div>
      </div>
    </div>

    <!-- Print Button (hidden when printing) -->
    <div class="print-actions" v-if="!isPrinting">
      <button @click="printClaim" class="print-btn">🖨️ Print Claim</button>
      <button @click="goBack" class="back-btn">← Back to Claims</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isPrinting = ref(false)

const props = defineProps({
  claim: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  logoSrc: {
    type: String,
    default: '',
  },
})

// Parse the description field (which contains medicine details)
const parsedDescription = computed(() => {
  if (!props.claim.description) return []

  let description = props.claim.description

  // If it's a string, try to parse it as JSON
  if (typeof description === 'string') {
    try {
      description = JSON.parse(description)
    } catch {
      // If parsing fails, return as single item
      return [{ medicine: description, price: props.claim.amount }]
    }
  }

  // If it's an array, return it
  if (Array.isArray(description)) {
    return description
  }

  // If it's an object, wrap it in an array
  if (typeof description === 'object') {
    return [description]
  }

  return []
})

// Create approval timeline from flow_history
const approvalStages = computed(() => {
  const stages = [
    { name: 'Supervisor', key: 'supervisor' },
    { name: 'Manager', key: 'manager' },
    { name: 'HR', key: 'hr' },
    { name: 'Account', key: 'account' },
  ]

  let history = []
  if (props.claim.flow_history) {
    try {
      history =
        typeof props.claim.flow_history === 'string'
          ? JSON.parse(props.claim.flow_history)
          : props.claim.flow_history
    } catch {
      history = []
    }
  }

  return stages.map((stage) => {
    const historyEntry = history.find((h) => h.stage === stage.key)
    const currentStage = props.claim.stage
    const status = props.claim.status

    if (historyEntry) {
      return {
        name: stage.name,
        status: historyEntry.action,
        approver: historyEntry.by_name,
        date: historyEntry.at,
        reason: historyEntry.reason,
      }
    } else if (currentStage === stage.key && status === 'pending') {
      return {
        name: stage.name,
        status: 'pending',
        approver: null,
        date: null,
        reason: null,
      }
    } else if (status === 'rejected' && currentStage === stage.key) {
      return {
        name: stage.name,
        status: 'rejected',
        approver: null,
        date: null,
        reason: null,
      }
    } else {
      return {
        name: stage.name,
        status: 'not-reached',
        approver: null,
        date: null,
        reason: null,
      }
    }
  })
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const printClaim = () => {
  isPrinting.value = true
  setTimeout(() => {
    window.print()
    isPrinting.value = false
  }, 100)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.print-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #fff;
  color: #222;
  font-family: 'Segoe UI', Arial, sans-serif;
  line-height: 1.4;
}

.logo-section {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  max-height: 80px;
  max-width: 220px;
  margin: 0 auto;
}

.company-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.main-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  border: 2px solid #333;
}

.form-title {
  text-align: center;
  font-size: 1.35rem;
  font-weight: bold;
  padding: 16px 0 12px 0;
  letter-spacing: 1px;
  background: #f8f9fa;
  border-bottom: 2px solid #333;
}

.info-cell {
  font-size: 1.08rem;
  padding: 12px 16px;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.info-value {
  font-weight: 600;
  margin-left: 8px;
  color: #2563eb;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
  border: 2px solid #333;
}

.items-table th,
.items-table td {
  border: 1px solid #444;
  padding: 12px 10px;
  font-size: 1rem;
  text-align: left;
}

.items-table th {
  background: #f3f4f6;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #333;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.total-row {
  background: #f8f9fa;
  font-weight: bold;
}

.total-label {
  font-size: 1.1rem;
}

.total-amount {
  font-size: 1.2rem;
  color: #059669;
}

.approval-section {
  margin-bottom: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: #374151;
  text-align: center;
}

.timeline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.timeline-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  background: white;
}

.stage-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 8px;
  color: #374151;
}

.stage-status {
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.stage-status.approved {
  color: #059669;
}

.stage-status.rejected {
  color: #dc2626;
}

.stage-status.pending {
  color: #d97706;
}

.stage-status.not-reached {
  color: #6b7280;
}

.stage-details {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.3;
}

.rejection-reason {
  color: #dc2626;
  font-style: italic;
}

.signature-section-2col {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 32px 16px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 2px solid #333;
}
.sig-col {
  flex: 1 1 220px;
  min-width: 220px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}
.sig-field {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}
.sig-label {
  white-space: nowrap;
}
.sig-underline-dashed {
  border-bottom: 2px dashed #222;
  width: 100%;
  min-width: 120px;
  height: 1.2em;
  margin-bottom: 1.5rem;
}
.print-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ddd;
}

.print-btn,
.back-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.print-btn {
  background: #2563eb;
  color: white;
}

.print-btn:hover {
  background: #1d4ed8;
}

.back-btn {
  background: #6b7280;
  color: white;
}

.back-btn:hover {
  background: #4b5563;
}

@media print {
  body * {
    visibility: hidden !important;
  }
  .print-container,
  .print-container * {
    visibility: visible !important;
  }
  .print-container {
    position: absolute !important;
    left: 0;
    top: 0;
    width: 100vw;
    background: #fff;
    box-shadow: none;
    padding: 0;
    margin: 0;
    max-width: none;
  }
  .print-actions {
    display: none !important;
  }
  .logo-section {
    margin-bottom: 12px;
  }
  .main-table,
  .items-table {
    margin-bottom: 18px;
  }
  .approval-section {
    margin-bottom: 24px;
    padding: 16px;
  }
  .signature-section-2col {
    margin-top: 32px;
    gap: 18px 8px;
  }
}
</style>
