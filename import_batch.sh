#!/bin/bash
# Bulk import RDC + Congo-Brazzaville hotels via Google Places
BASE="http://localhost:3000/api/import/hotels"
LOG=/tmp/import_progress.log
echo "START $(date)" > "$LOG"

import_city () {
  local city="$1"; local province="$2"; local country="$3"
  local resp
  resp=$(curl -s -X POST "$BASE" -H "Content-Type: application/json" \
    -d "{\"city\":\"$city\",\"province\":\"$province\",\"country\":\"$country\",\"region\":\"Afrique Centrale\",\"max\":20}")
  # extract fetched/imported/updated
  local summary
  summary=$(echo "$resp" | python3 -c "import sys,json
try:
  d=json.load(sys.stdin)
  if 'error' in d: print('ERROR: '+str(d['error']))
  else: print(f\"fetched={d.get('fetched')} imported={d.get('imported')} updated={d.get('updated')}\")
except Exception as e: print('PARSE_ERR: '+sys.stdin.read()[:200])" 2>/dev/null)
  echo "[$country] $city -> $summary" >> "$LOG"
}

# RDC cities
import_city "Kinshasa" "Kinshasa" "RD Congo"
import_city "Lubumbashi" "Haut-Katanga" "RD Congo"
import_city "Goma" "Nord-Kivu" "RD Congo"
import_city "Bukavu" "Sud-Kivu" "RD Congo"
import_city "Kisangani" "Tshopo" "RD Congo"
import_city "Matadi" "Kongo Central" "RD Congo"
import_city "Kananga" "Kasaï Central" "RD Congo"
import_city "Mbuji-Mayi" "Kasaï Oriental" "RD Congo"
import_city "Mbandaka" "Équateur" "RD Congo"
import_city "Kolwezi" "Lualaba" "RD Congo"
import_city "Tshikapa" "Kasaï" "RD Congo"
import_city "Likasi" "Haut-Katanga" "RD Congo"
import_city "Bunia" "Ituri" "RD Congo"
import_city "Uvira" "Sud-Kivu" "RD Congo"
import_city "Boma" "Kongo Central" "RD Congo"

# Congo-Brazzaville cities
import_city "Brazzaville" "Brazzaville" "Congo-Brazzaville"
import_city "Pointe-Noire" "Pointe-Noire" "Congo-Brazzaville"
import_city "Dolisie" "Niari" "Congo-Brazzaville"
import_city "Nkayi" "Bouenza" "Congo-Brazzaville"
import_city "Ouesso" "Sangha" "Congo-Brazzaville"
import_city "Owando" "Cuvette" "Congo-Brazzaville"
import_city "Oyo" "Cuvette" "Congo-Brazzaville"
import_city "Impfondo" "Likouala" "Congo-Brazzaville"

echo "DONE $(date)" >> "$LOG"
