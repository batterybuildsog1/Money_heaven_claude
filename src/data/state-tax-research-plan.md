# Property Tax Research & Validation Plan

## Overview
Systematic research and validation of property tax rates and exemptions for all 50 US states.

## Data Points Required Per State

### Essential Information
1. **Base State Rate**: Average property tax rate
2. **Top 3-5 Counties**: Most populous counties with rates
3. **Major Cities**: City-specific rates where applicable
4. **Residential Exemptions**: 
   - Homestead exemption ($ or %)
   - Income requirements
   - Application process
5. **Special Exemptions**:
   - Senior (age requirement, amount)
   - Veteran (eligibility, amount)
   - Disability (criteria, amount)
6. **Unique Rules**: State-specific calculations or caps

### Validation Requirements
- [ ] Official source confirmed (assessor website)
- [ ] 2024/2025 rates verified
- [ ] Exemption amounts current
- [ ] Calculate test case ($500k home)
- [ ] Cross-reference with 2+ sources

## Priority Classification

### Tier 1: Already Partially Complete (6 states)
✅ Data exists, needs validation
- [x] Utah (UT)
- [x] Arizona (AZ) 
- [x] Nevada (NV)
- [x] Texas (TX)
- [x] California (CA)
- [x] Florida (FL)

### Tier 2: High FHA Volume States (15 states)
🔴 Critical for app accuracy
- [ ] New York (NY)
- [ ] Illinois (IL)
- [ ] Pennsylvania (PA)
- [ ] Ohio (OH)
- [ ] Michigan (MI)
- [ ] Georgia (GA)
- [ ] North Carolina (NC)
- [ ] Virginia (VA)
- [ ] Maryland (MD)
- [ ] New Jersey (NJ)
- [ ] Massachusetts (MA)
- [ ] Washington (WA)
- [ ] Colorado (CO)
- [ ] Tennessee (TN)
- [ ] Missouri (MO)

### Tier 3: Medium Priority States (15 states)
🟡 Moderate FHA activity
- [ ] Indiana (IN)
- [ ] Wisconsin (WI)
- [ ] Minnesota (MN)
- [ ] Oregon (OR)
- [ ] South Carolina (SC)
- [ ] Alabama (AL)
- [ ] Louisiana (LA)
- [ ] Kentucky (KY)
- [ ] Oklahoma (OK)
- [ ] Connecticut (CT)
- [ ] Iowa (IA)
- [ ] Arkansas (AR)
- [ ] Mississippi (MS)
- [ ] Kansas (KS)
- [ ] New Mexico (NM)

### Tier 4: Lower Priority States (14 states)
🟢 Lower population/FHA volume
- [ ] Nebraska (NE)
- [ ] Idaho (ID)
- [ ] Hawaii (HI)
- [ ] New Hampshire (NH)
- [ ] Maine (ME)
- [ ] Montana (MT)
- [ ] Rhode Island (RI)
- [ ] Delaware (DE)
- [ ] South Dakota (SD)
- [ ] North Dakota (ND)
- [ ] Alaska (AK)
- [ ] Vermont (VT)
- [ ] Wyoming (WY)
- [ ] West Virginia (WV)

## Research Process Per State

### Step 1: Agent Query for Base Information
```
Task: Research [STATE] property tax 2024/2025
1. Find state average property tax rate
2. Identify top 5 counties by population
3. Get rates for each county
4. Find homestead exemption details
5. Document senior/veteran/disability exemptions
Return: Structured JSON with sources
```

### Step 2: Validation Query
```
Task: Validate [STATE] property tax data
Given: [Previous research results]
1. Verify rates against official county assessor sites
2. Confirm exemption amounts are current
3. Check for recent law changes
4. Calculate tax on $500k primary residence
Return: Validation status and corrections
```

### Step 3: Edge Case Query
```
Task: Find special rules for [STATE]
1. Any tax caps or limits?
2. Special assessment rules?
3. Unique exemptions?
4. Agricultural or rural considerations?
Return: Additional rules and exceptions
```

## Data Collection Template

```json
{
  "state": "XX",
  "name": "State Name",
  "lastUpdated": "2025-01-XX",
  "sources": ["url1", "url2"],
  "averageRate": 0.0000,
  "medianRate": 0.0000,
  "residentialExemption": {
    "type": "dollar|percentage|cap",
    "value": 0,
    "description": "",
    "incomeLimit": null,
    "requirements": []
  },
  "counties": {
    "County Name": {
      "baseRate": 0.0000,
      "population": 0,
      "assessorUrl": "",
      "cities": {
        "City Name": 0.0000
      }
    }
  },
  "specialExemptions": {
    "senior": {
      "minAge": 65,
      "amount": 0,
      "incomeLimit": null
    },
    "veteran": {
      "amount": 0,
      "disabilityRequired": false,
      "combatRequired": false
    },
    "disability": {
      "amount": 0,
      "percentageRequired": null
    }
  },
  "specialRules": {
    "taxCap": null,
    "assessmentLimit": null,
    "prop13Style": false,
    "circuitBreaker": false,
    "notes": ""
  },
  "testCalculation": {
    "homeValue": 500000,
    "primaryResidence": true,
    "expectedTax": 0,
    "effectiveRate": 0.0000
  }
}
```

## Validation Checklist

### Per State Validation
- [ ] State average rate sourced from official data
- [ ] Top 3 counties verified against assessor sites
- [ ] Homestead exemption confirmed with state law
- [ ] Senior exemption age and amount verified
- [ ] Veteran exemption requirements checked
- [ ] Test calculation matches expected results
- [ ] Data less than 6 months old
- [ ] Cross-referenced with at least 2 sources

### Quality Metrics
- **High Confidence**: Official source + recent update + test validated
- **Medium Confidence**: Official source OR recent update
- **Low Confidence**: Secondary sources only or data > 1 year old

## Implementation Timeline

### Week 1: Tier 1 Validation
- Day 1-2: Validate existing 6 states
- Day 3-5: Update and test calculations

### Week 2: Tier 2 States (Part 1)
- Day 1: NY, NJ, PA
- Day 2: IL, OH, MI
- Day 3: GA, NC, VA
- Day 4: MD, MA, WA
- Day 5: CO, TN, MO

### Week 3: Tier 3 States
- 3 states per day
- Focus on most populous counties

### Week 4: Tier 4 States
- 3-4 states per day
- Simplified data (state average + exemptions)

## Success Criteria

1. **Coverage**: All 50 states documented
2. **Accuracy**: 95%+ match with official calculators
3. **Currency**: All data from 2024/2025
4. **Completeness**: Top 3 counties per state minimum
5. **Validation**: Each state tested with $500k home scenario

## Next Steps

1. Start with Tier 1 validation (existing states)
2. Use parallel agent queries for efficiency
3. Store results in `property-tax-rates-2025.json`
4. Create state-specific test files
5. Build confidence scoring system
6. Implement automatic update reminders