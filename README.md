# 🧠 Système de calcul distribué avec RabbitMQ

#### 👨‍💻 Membres de l'équipe
- **KODIR Abdul**  
- **ROUX Thomas**  
- **PEYREGNE Timothé**  
- **DIAG Mohamed**  

---

## 📘 Description

Ce projet a été réalisé dans le cadre d'un cours sur les systèmes de messagerie et vise à simuler un **système de calcul distribué** en utilisant **RabbitMQ** comme **broker de messages**.

Des **clients producteurs** génèrent aléatoirement des requêtes de calcul (`add`, `sub`, `mul`, `div`, `all`) sous forme de messages JSON, qui sont ensuite distribuées à des **workers spécialisés** via RabbitMQ. Ces workers traitent les calculs, simulent un temps de traitement, et renvoient les résultats à un **client consommateur** qui les affiche.

---

## 🔧 Technologies utilisées

- 🐇 **RabbitMQ** – système de messagerie AMQP
- 💻 **Node.js**
- 🧪 **JavaScript / TypeScript**
- 🐳 **Docker / Docker Compose**
- 🎨 **React** – interface utilisateur
- 📦 **amqplib** – librairie Node.js pour RabbitMQ

---

## ▶️ Mise en place

### 1. Cloner le dépôt

```bash
git clone https://github.com/abdul-kodir2020/rabbit_mq_project.git
cd rabbit_mq_project
```

2. Lancer le projet avec Docker
```bash
docker-compose up
```

📝 Assurez-vous que Docker et Docker Compose sont bien installés.

# ⚙️ Fonctionnement

📤 Producer –> Envoi de requêtes
Le script producer.js envoie automatiquement des requêtes de calcul toutes les 1 à 5 secondes.
Chaque message contient deux opérandes aléatoires (n1 et n2) et un type d’opération choisi aléatoirement parmi :

* add : addition

* sub : soustraction

* mul : multiplication

* div : division

* all : envoie le calcul à tous les workers

```json
{
  "n1": 10,
  "n2": 5
}
```

Comportement :
Si l'opération est add, sub, mul, ou div, le message est publié sur un exchange direct (calc_exchange) avec une clé de routage correspondant à l'opération.

Si l'opération est all, le message est envoyé via un exchange fanout (fanout_exchange) à tous les workers.

👉 Cela permet de simuler un traitement distribué sur différents types de nœuds.

🧮 Workers – Traitement des calculs
Il existe 4 types de workers, chacun responsable d’une opération :

* worker add

* worker sub

* worker mul

* worker div

Chaque worker :

1. Écoute la queue qui lui est assignée.

2. Récupère les messages correspondant à son opération.

3. Effectue le calcul demandé.

4. Simule une latence de 5 à 15 secondes.

5. Envoie le résultat dans la queue des résultats.

Exemple de message de réponse :
---

```json
{
  "n1": 10,
  "n2": 5,
  "op": "add",
  "result": 15
}
```
## 📥 Consumer – Affichage des résultats
Le consumer écoute la queue des résultats (results_queue) et affiche les résultats à l'écran.

Chaque résultat reçu est affiché sous la forme :

```csharp
[RESULT] 10 add 5 = 15
```

## 🧪 Bonus – Améliorations apportées
✅ Ajout d'une opération all envoyée à tous les workers

✅ Assignation dynamique de l’opération au démarrage du worker (node worker.js add)

✅ Mise en place d’un frontend React pour l’affichage des résultats (interface utilisateur)

✅ Containerisation complète avec Docker et Docker Compose

✅ Code modulaire et facilement extensible (ajout d'autres opérations possible)

📂 Arborescence simplifiée du projet
```bash
.
├── backend/               # Backend logic (workers, producer, consumer)
├── frontend/              # Interface utilisateur en React
├── common/                # Connexion RabbitMQ partagée
├── consumers/             # Clients qui récupèrent les résultats
├── producers/             # Générateurs de requêtes
├── workers/               # Workers spécialisés
├── rabbitmq/              # Config et Docker pour RabbitMQ
├── docker-compose.yml     # Orchestration complète
└── README.md              # Ce fichier 🙂
```
## 📜 Commandes utiles (en Local)
Lancer le worker template
```bash
node rabbitmq/workers/worker_template.js
```
Lancer le producer manuellement
```bash
node rabbitmq/producers/producer.js
```
Lancer le consumer manuellement
```bash
node rabbitmq/consumers/consumer.js
```