import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import type { CSPViolationReport } from "../../security/monitoring/csp-collector";

interface ViolationStats {
  directive: string;
  count: number;
}

interface FirestoreViolation extends DocumentData {
  blockedURI: string;
  documentURI: string;
  violatedDirective: string;
  originalPolicy: string;
  timestamp: { toDate: () => Date };
  userAgent: string;
  clientId?: string;
}

export const CSPDashboard: React.FC = () => {
  const [recentViolations, setRecentViolations] = useState<
    CSPViolationReport[]
  >([]);
  const [stats, setStats] = useState<ViolationStats[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const violationsRef = collection(db, "csp-violations");

    // Écoute des 10 dernières violations
    const recentQuery = query(
      violationsRef,
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(recentQuery, (snapshot) => {
      const violations = snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreViolation;
        return {
          id: doc.id,
          blockedURI: data.blockedURI,
          documentURI: data.documentURI,
          violatedDirective: data.violatedDirective,
          originalPolicy: data.originalPolicy,
          timestamp: data.timestamp.toDate(),
          userAgent: data.userAgent,
          clientId: data.clientId,
        } satisfies CSPViolationReport;
      });

      setRecentViolations(violations);

      // Calcul des statistiques
      const directiveCounts: { [key: string]: number } = {};
      violations.forEach((violation) => {
        const directive = violation.violatedDirective.split("-")[0];
        directiveCounts[directive] = (directiveCounts[directive] || 0) + 1;
      });

      const newStats = Object.entries(directiveCounts).map(
        ([directive, count]) => ({
          directive,
          count,
        })
      );

      setStats(newStats);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          CSP Violations Dashboard
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Violations par Directive
            </Typography>
            <BarChart width={500} height={300} data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="directive" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Violations Récentes
            </Typography>
            <List>
              {recentViolations.map((violation, index) => (
                <ListItem key={violation.id || index} divider>
                  <ListItemText
                    primary={violation.violatedDirective}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          URI bloqué: {violation.blockedURI}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Date: {violation.timestamp.toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
