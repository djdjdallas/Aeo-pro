// lib/tracker/pdf-report.js
// Server-side PDF report generation using @react-pdf/renderer

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const colors = {
  bg: "#0a0a0a",
  card: "#111111",
  border: "#1f1f1f",
  text: "#ffffff",
  muted: "#6b7280",
  accent: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  gray: "#9ca3af",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    padding: 40,
    fontFamily: "Helvetica",
    color: colors.text,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  titleAccent: {
    color: colors.accent,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
  },
  businessName: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: "bold",
    marginTop: 8,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.muted,
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: "bold",
  },
  scoreCaption: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.muted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.muted,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableCell: {
    fontSize: 11,
    color: colors.gray,
  },
  tableCellBold: {
    fontSize: 11,
    fontWeight: "bold",
  },
  sentimentRow: {
    flexDirection: "row",
    gap: 12,
  },
  competitorBadge: {
    backgroundColor: "rgba(107,114,128,0.15)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  competitorText: {
    fontSize: 10,
    color: colors.gray,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: colors.muted,
  },
});

function rateColor(rate) {
  if (rate === null || rate === undefined) return colors.muted;
  if (rate >= 50) return colors.green;
  if (rate >= 20) return colors.yellow;
  return colors.red;
}

function AEOReport({ clientData, startDate, endDate }) {
  const c = clientData;

  const start = new Date(startDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const end = new Date(endDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Monthly AI Visibility Report
          </Text>
          <Text style={styles.subtitle}>{start} — {end}</Text>
          <Text style={styles.businessName}>{c.business_name}</Text>
        </View>

        {/* AEO Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>AEO Composite Score</Text>
          <Text style={[styles.scoreValue, { color: rateColor(c.aeo_score) }]}>
            {c.aeo_score !== null && c.aeo_score !== undefined ? c.aeo_score : "—"}
          </Text>
          <Text style={styles.scoreCaption}>out of 100</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Mention Rate</Text>
            <Text style={[styles.metricValue, { color: rateColor(c.overall_rate) }]}>
              {c.overall_rate !== null ? `${c.overall_rate}%` : "—"}
            </Text>
            {c.mention_rate_ci && (
              <Text style={{ fontSize: 8, color: colors.muted, marginTop: 2 }}>
                CI: {c.mention_rate_ci.lower}%-{c.mention_rate_ci.upper}%
              </Text>
            )}
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Share of Voice</Text>
            <Text style={[styles.metricValue, { color: colors.accent }]}>
              {c.sov ? `${c.sov.sov}%` : "—"}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Position Quality</Text>
            <Text style={[styles.metricValue, { color: rateColor(c.pqs) }]}>
              {c.pqs !== null && c.pqs !== undefined ? c.pqs : "—"}
            </Text>
          </View>
        </View>

        {/* Sentiment */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sentiment Analysis</Text>
          <View style={styles.sentimentRow}>
            <Text style={{ fontSize: 13, color: colors.green, fontWeight: "bold" }}>
              +{c.sentiment?.positive || 0} positive
            </Text>
            <Text style={{ fontSize: 13, color: colors.gray }}>
              {c.sentiment?.neutral || 0} neutral
            </Text>
            <Text style={{ fontSize: 13, color: colors.red, fontWeight: "bold" }}>
              -{c.sentiment?.negative || 0} negative
            </Text>
          </View>
        </View>

        {/* Model Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance by AI Model</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Model</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>Rate</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>Checks</Text>
          </View>
          {(c.models || []).map((m, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{m.model}</Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: "center", color: rateColor(m.rate) }]}>
                {m.rate}%
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>
                {m.mentioned}/{m.total}
              </Text>
            </View>
          ))}
        </View>

        {/* Competitors */}
        {c.sov?.topCompetitors?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Competitors</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {c.sov.topCompetitors.map((comp, i) => (
                <View key={i} style={styles.competitorBadge}>
                  <Text style={styles.competitorText}>
                    {comp.name} ({comp.count})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Total checks */}
        <Text style={{ textAlign: "center", fontSize: 10, color: colors.muted, marginTop: 8 }}>
          Based on {c.total_checks} AI model checks this period
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            First Answer AI Visibility Report — firstanswer.co
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate a PDF buffer for a client's monthly report.
 * @param {Object} clientData - Client report data from buildMonthlyReportData
 * @param {string} startDate - Report period start
 * @param {string} endDate - Report period end
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateReportPDF(clientData, startDate, endDate) {
  const buffer = await renderToBuffer(
    React.createElement(AEOReport, { clientData, startDate, endDate })
  );
  return buffer;
}
