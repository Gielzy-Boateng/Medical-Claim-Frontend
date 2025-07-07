<template>
  <div class="print-container">
    <!-- Logo -->
    <div class="logo-section">
      <img :src="logoSrc" alt="Logo" class="logo" v-if="logoSrc" />
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
            Employee Name: <span class="info-value">{{ claim.employeeName }}</span>
          </td>
          <td class="info-cell">
            Date:
            <span class="info-value">{{
              claim.date ||
              (claim.created_at ? new Date(claim.created_at).toLocaleDateString() : '')
            }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Relation to Employee</th>
          <th>Description of Expenditure</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in claim.items || []" :key="idx">
          <td>{{ item.date || '' }}</td>
          <td>{{ item.name || '' }}</td>
          <td>{{ item.relation || '' }}</td>
          <td>{{ item.description || item.medicine || '' }}</td>
          <td>{{ item.amount || item.price || '' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Signature Section -->
    <div class="signature-section">
      <div class="sig-field">
        <span class="sig-label">Employee's Signature:</span>
        <span class="sig-underline"></span>
      </div>
      <div class="sig-field">
        <span class="sig-label">Date:</span>
        <span class="sig-underline"></span>
      </div>
      <div class="sig-field">
        <span class="sig-label">Finance Dept. Signature:</span>
        <span class="sig-underline"></span>
      </div>
      <div class="sig-field">
        <span class="sig-label">Finance Officer Name:</span>
        <span class="sig-underline"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
</script>

<style scoped>
.print-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #fff;
  color: #222;
  font-family: 'Segoe UI', Arial, sans-serif;
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
.main-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
}
.form-title {
  text-align: center;
  font-size: 1.35rem;
  font-weight: bold;
  padding: 16px 0 12px 0;
  letter-spacing: 1px;
}
.info-cell {
  font-size: 1.08rem;
  padding: 10px 0 10px 8px;
}
.info-value {
  font-weight: 500;
  margin-left: 8px;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
}
.items-table th,
.items-table td {
  border: 1px solid #444;
  padding: 8px 10px;
  font-size: 1rem;
  text-align: left;
}
.items-table th {
  background: #f3f4f6;
  font-weight: 600;
  text-align: center;
}
.signature-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 32px 16px;
  margin-top: 48px;
}
.sig-field {
  display: flex;
  align-items: center;
  min-width: 180px;
  flex: 1 1 200px;
  margin-bottom: 12px;
}
.sig-label {
  font-size: 1rem;
  margin-right: 10px;
  white-space: nowrap;
}
.sig-underline {
  border-bottom: 1.5px solid #222;
  flex: 1;
  min-width: 120px;
  height: 1.2em;
  margin-left: 6px;
}
@media print {
  .print-container {
    box-shadow: none;
    padding: 0;
    margin: 0;
  }
  .logo-section {
    margin-bottom: 12px;
  }
  .main-table,
  .items-table {
    margin-bottom: 18px;
  }
  .signature-section {
    margin-top: 32px;
    gap: 18px 8px;
  }
}
</style>
