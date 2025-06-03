import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";

const OPERATIONS = ["add", "sub", "mul", "div", "all"];

function App() {
  const [n1, setN1] = useState(1);
  const [n2, setN2] = useState(1);
  const [operation, setOperation] = useState("add");
  const [autoSend, setAutoSend] = useState(false);
  const [intervalSec, setIntervalSec] = useState(5);
  const [sentOps, setSentOps] = useState([]);
  const [results, setResults] = useState([]);

  // Gestion de l’état de connexion WebSocket
  const [wsStatus, setWsStatus] = useState("connecting");
  const [apiError, setApiError] = useState("");

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    avgResponse: 0,
    errors: 0,
    success: 0,
  });

// Connexion Socket.IO pour recevoir les résultats du backend
useEffect(() => {
  const socket = io(WS_URL);
  setWsStatus("connecting");
  socket.on("connect", () => setWsStatus("connected"));
  socket.on("disconnect", () => setWsStatus("closed"));
  socket.on("connect_error", () => setWsStatus("error"));
  socket.on("result", (result) => {
    setResults((res) => [
      ...res,
      { ...result, timestamp: new Date().toLocaleTimeString() },
    ]);
    setSentOps((ops) =>
      ops.map((op, idx) =>
        op.n1 === result.n1 && op.n2 === result.n2 && op.op === result.op
          ? { ...op, status: "received", receivedAt: Date.now() }
          : op
      )
    );
    // Mise à jour des stats
    setStats((stats) => {
      // Trouver l'opération envoyée correspondante pour calculer le temps de réponse
      const matchedOp = sentOps.find(
        (op) => op.n1 === result.n1 && op.n2 === result.n2 && op.op === result.op && op.status === "pending"
      );
      let responseTime = 0;
      if (matchedOp && matchedOp.timestamp) {
        // matchedOp.timestamp est au format localTimeString, donc on ne peut pas faire de diff directe
        // On utilise receivedAt (ms) si dispo, sinon on n'update pas le temps de réponse
        if (matchedOp.receivedAt) {
          responseTime = (matchedOp.receivedAt - matchedOp.sentAt) / 1000;
        }
      }
      // Calcul du nouveau temps de réponse moyen
      const prevCount = stats.total;
      const newAvg = prevCount > 0 && responseTime > 0 ? ((stats.avgResponse * prevCount + responseTime) / (prevCount + 1)) : stats.avgResponse;
      // Mise à jour du type d'opération
      const byType = { ...stats.byType };
      byType[result.op] = (byType[result.op] || 0) + 1;
      // Succès si pas d'erreur
      const isSuccess = typeof result.result !== 'undefined' && result.result !== null && !isNaN(result.result);
      return {
        ...stats,
        total: stats.total + 1,
        byType,
        avgResponse: newAvg,
        success: stats.success + (isSuccess ? 1 : 0),
        errors: stats.errors + (!isSuccess ? 1 : 0),
      };
    });
  });
  return () => socket.disconnect();
  // eslint-disable-next-line
}, []);

  // Envoi vers le backend
const BACKEND_URL = "http://localhost:4000";
const WS_URL = "ws://localhost:4000";

const sendOperation = async (payload) => {
  setSentOps((ops) => [
    ...ops,
    { ...payload, status: "pending", timestamp: new Date().toLocaleTimeString() },
  ]);
  try {
    await fetch(`${BACKEND_URL}/operation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setApiError("");
  } catch (e) {
    setSentOps((ops) =>
      ops.map((op, idx) =>
        idx === ops.length - 1 ? { ...op, status: "erreur" } : op
      )
    );
    setApiError("Erreur lors de l'envoi à l'API : " + e.message);
    setStats((s) => ({ ...s, errors: s.errors + 1 }));
  }
};

  useEffect(() => {
    if (!autoSend) return;
    const timer = setInterval(() => {
      const randomOp = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      const n1r = Math.floor(Math.random() * 100);
      const n2r = Math.floor(Math.random() * 100);
      sendOperation({ n1: n1r, n2: n2r, op: randomOp });
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [autoSend, intervalSec]);

  const handleManualSend = () => {
    sendOperation({ n1, n2, op: operation });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Système de Calcul Distribué – NGI
      </Typography>
      {/* Affichage état connexion et erreurs */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          WebSocket : {wsStatus === "connected" ? "Connecté" : wsStatus === "connecting" ? "Connexion..." : wsStatus === "error" ? "Erreur" : "Déconnecté"}
        </Typography>
        {apiError && (
          <Box sx={{ color: 'red', mt: 1 }}>{apiError}</Box>
        )}
      </Box>
      {/* Statistiques */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: '#f7f7f7' }}>
        <Typography variant="h6">Statistiques</Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}><b>Total opérations traitées :</b> {stats.total}</Grid>
          <Grid item xs={3}><b>Succès :</b> {stats.success}</Grid>
          <Grid item xs={3}><b>Erreurs :</b> {stats.errors}</Grid>
          <Grid item xs={3}><b>Temps de réponse moyen :</b> {stats.avgResponse ? stats.avgResponse.toFixed(2) + 's' : '-'}</Grid>
        </Grid>
        <Box sx={{ mt: 1 }}>
          <b>Par type :</b> {Object.entries(stats.byType).map(([op, count]) => `${op}: ${count}`).join(' | ') || '-'}
        </Box>
      </Paper>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Nouvelle opération</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={2}>
            <TextField
              label="n1"
              type="number"
              value={n1}
              onChange={(e) => setN1(Number(e.target.value))}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="n2"
              type="number"
              value={n2}
              onChange={(e) => setN2(Number(e.target.value))}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              label="Opération"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              fullWidth
            >
              {OPERATIONS.map((op) => (
                <MenuItem key={op} value={op}>
                  {op.toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleManualSend}
              fullWidth
            >
              Envoyer
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoSend}
                onChange={() => setAutoSend((a) => !a)}
                color="primary"
              />
            }
            label="Envoi automatique"
          />
          {autoSend && (
            <TextField
              label="Intervalle (s)"
              type="number"
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              size="small"
              sx={{ ml: 2, width: 120 }}
            />
          )}
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, height: 400, overflow: "auto" }}>
            <Typography variant="h6">Opérations envoyées</Typography>
            <List>
              {sentOps.map((op, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`[${op.timestamp}] ${op.n1} ${op.op.toUpperCase()} ${op.n2}`}
                    secondary={`Statut: ${op.status}`}
                  />
                </ListItem>
              ))}
              {sentOps.length === 0 && <ListItem>Aucune opération envoyée.</ListItem>}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, height: 400, overflow: "auto" }}>
            <Typography variant="h6">Résultats reçus</Typography>
            <List>
              {results.map((res, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={`[${res.timestamp}] ${res.n1} ${res.op.toUpperCase()} ${res.n2} = ${res.result}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {results.length === 0 && <ListItem>Aucun résultat reçu.</ListItem>}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function calc(n1, n2, op) {
  switch (op) {
    case "add":
      return n1 + n2;
    case "sub":
      return n1 - n2;
    case "mul":
      return n1 * n2;
    case "div":
      return n2 !== 0 ? (n1 / n2).toFixed(2) : "Erreur";
    case "all":
      return `add:${n1 + n2}, sub:${n1 - n2}, mul:${n1 * n2}, div:${n2 !== 0 ? (n1 / n2).toFixed(2) : "Erreur"}`;
    default:
      return "?";
  }
}

export default App;
