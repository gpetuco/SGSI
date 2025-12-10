export const NIST_CSF_DATA = {
  functions: [
    {
      name: "GOVERN (GV): The organization’s cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored",
      categories: [
        {
          name: "Organizational Context (GV.OC): The circumstances — mission, stakeholder expectations, dependencies, and legal, regulatory, and contractual requirements — surrounding the organization’s cybersecurity risk management decisions are understood",
          subcategories: [
            {
              name: "GV.OC-01: The organizational mission is understood and informs cybersecurity risk management",
            },
            {
              name: "GV.OC-02: Internal and external stakeholders are understood, and their needs and expectations regarding cybersecurity risk management are understood and considered",
            },
            {
              name: "GV.OC-03: Legal, regulatory, and contractual requirements regarding cybersecurity — including privacy and civil liberties obligations — are understood and managed",
            },
            {
              name: "GV.OC-04: Critical objectives, capabilities, and services that external stakeholders depend on or expect from the organization are understood and communicated",
            },
            {
              name: "GV.OC-05: Outcomes, capabilities, and services that the organization depends on are understood and communicated",
            },
          ],
        },
        {
          name: "Risk Management Strategy (GV.RM): The organization’s priorities, constraints, risk tolerance and appetite statements, and assumptions are established, communicated, and used to support operational risk decisions",
          subcategories: [
            {
              name: "GV.RM-01: Risk management objectives are established and agreed to by organizational stakeholders",
            },
            {
              name: "GV.RM-02: Risk appetite and risk tolerance statements are established, communicated, and maintained",
            },
            {
              name: "GV.RM-03: Cybersecurity risk management activities and outcomes are included in enterprise risk management processes",
            },
            {
              name: "GV.RM-04: Strategic direction that describes appropriate risk response options is established and communicated",
            },
            {
              name: "GV.RM-05: Lines of communication across the organization are established for cybersecurity risks, including risks from suppliers and other third parties",
            },
            {
              name: "GV.RM-06: A standardized method for calculating, documenting, categorizing, and prioritizing cybersecurity risks is established and communicated",
            },
            {
              name: "GV.RM-07: Strategic opportunities (i.e., positive risks) are characterized and are included in organizational cybersecurity risk discussions",
            },
          ],
        },
        {
          name: "Roles, Responsibilities, and Authorities (GV.RR): Cybersecurity roles, responsibilities, and authorities to foster accountability, performance assessment, and continuous improvement are established and communicated",
          subcategories: [
            {
              name: "GV.RR-01: Organizational leadership is responsible and accountable for cybersecurity risk and fosters a culture that is risk-aware, ethical, and continually improving",
            },
            {
              name: "GV.RR-02: Roles, responsibilities, and authorities related to cybersecurity risk management are established, communicated, understood, and enforced",
            },
            {
              name: "GV.RR-03: Adequate resources are allocated commensurate with the cybersecurity risk strategy, roles, responsibilities, and policies",
            },
            {
              name: "GV.RR-04: Cybersecurity is included in human resources practices",
            },
          ],
        },
        {
          name: "Policy (GV.PO): Organizational cybersecurity policy is established, communicated, and enforced",
          subcategories: [
            {
              name: "GV.PO-01: Policy for managing cybersecurity risks is established based on organizational context, cybersecurity strategy, and priorities and is communicated and enforced",
            },
            {
              name: "GV.PO-02: Policy for managing cybersecurity risks is reviewed, updated, communicated, and enforced to reflect changes in requirements, threats, technology, and organizational mission",
            },
          ],
        },
        {
          name: "Oversight (GV.OV): Results of organization-wide cybersecurity risk management activities and performance are used to inform, improve, and adjust the risk management strategy",
          subcategories: [
            {
              name: "GV.OV-01: Cybersecurity risk management strategy outcomes are reviewed to inform and adjust strategy and direction",
            },
            {
              name: "GV.OV-02: The cybersecurity risk management strategy is reviewed and adjusted to ensure coverage of organizational requirements and risks",
            },
            {
              name: "GV.OV-03: Organizational cybersecurity risk management performance is evaluated and reviewed for adjustments needed",
            },
          ],
        },
        {
          name: "Cybersecurity Supply Chain Risk Management (GV.SC): Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by organizational stakeholders",
          subcategories: [
            {
              name: "GV.SC-01: A cybersecurity supply chain risk management program, strategy, objectives, policies, and processes are established and agreed to by organizational stakeholders",
            },
            {
              name: "GV.SC-02: Cybersecurity roles and responsibilities for suppliers, customers, and partners are established, communicated, and coordinated internally and externally",
            },
            {
              name: "GV.SC-03: Cybersecurity supply chain risk management is integrated into cybersecurity and enterprise risk management, risk assessment, and improvement processes",
            },
            {
              name: "GV.SC-05: Requirements to address cybersecurity risks in supply chains are established, prioritized, and integrated into contracts and other types of agreements with suppliers and other relevant third parties",
            },
            {
              name: "GV.SC-06: Planning and due diligence are performed to reduce risks before entering into formal supplier or other third-party relationships",
            },
            {
              name: "GV.SC-07: The risks posed by a supplier, their products and services, and other third parties are understood, recorded, prioritized, assessed, responded to, and monitored over the course of the relationship",
            },
            {
              name: "GV.SC-08: Relevant suppliers and other third parties are included in incident planning, response, and recovery activities",
            },
            {
              name: "GV.SC-09: Supply chain security practices are integrated into cybersecurity and enterprise risk management programs, and their performance is monitored throughout the technology product and service life cycle",
            },
            {
              name: "GV.SC-10: Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement",
            },
          ],
        },
      ],
    },
    {
      name: "IDENTIFY (ID): The organization’s current cybersecurity risks are understood",
      categories: [
        {
          name: "Asset Management (ID.AM): Assets (e.g., data, hardware, software, systems, facilities, services, people) that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to organizational objectives and the organization’s risk strategy",
          subcategories: [
            {
              name: "ID.AM-01: Inventories of hardware managed by the organization are maintained",
            },
            {
              name: "ID.AM-02: Inventories of software, services, and systems managed by the organization are maintained",
            },
            {
              name: "ID.AM-03: Representations of the organization’s authorized network communication and internal and external network data flows are maintained",
            },
            {
              name: "ID.AM-04: Inventories of services provided by suppliers are maintained",
            },
            {
              name: "o ID.AM-05: Assets are prioritized based on classification, criticality, resources, and impact on the mission",
            },
            {
              name: "ID.AM-07: Inventories of data and corresponding metadata for designated data types are maintained",
            },
            {
              name: "ID.AM-08: Systems, hardware, software, services, and data are managed throughout their life cycles",
            },
          ],
        },
        {
          name: "Risk Assessment (ID.RA): The cybersecurity risk to the organization, assets, and individuals is understood by the organization",
          subcategories: [
            {
              name: "ID.RA-01: Vulnerabilities in assets are identified, validated, and recorded",
            },
            {
              name: "ID.RA-02: Cyber threat intelligence is received from information sharing forums and sources",
            },
            {
              name: "ID.RA-03: Internal and external threats to the organization are identified and recorded",
            },
            {
              name: "ID.RA-04: Potential impacts and likelihoods of threats exploiting vulnerabilities are identified and recorded",
            },
            {
              name: "ID.RA-05: Threats, vulnerabilities, likelihoods, and impacts are used to understand inherent risk and inform risk response prioritization",
            },
            {
              name: "ID.RA-06: Risk responses are chosen, prioritized, planned, tracked, and communicated",
            },
            {
              name: "ID.RA-07: Changes and exceptions are managed, assessed for risk impact, recorded, and tracked",
            },
            {
              name: "ID.RA-08: Processes for receiving, analyzing, and responding to vulnerability disclosures are established",
            },
            {
              name: "ID.RA-09: The authenticity and integrity of hardware and software are assessed prior to acquisition and use",
            },
            {
              name: "ID.RA-10: Critical suppliers are assessed prior to acquisition",
            },
          ],
        },
        {
          name: "Improvement (ID.IM): Improvements to organizational cybersecurity risk management processes, procedures and activities are identified across all CSF Functions",
          subcategories: [
            {
              name: "ID.IM-01: Improvements are identified from evaluations",
            },
            {
              name: "ID.IM-02: Improvements are identified from security tests and exercises, including those done in coordination with suppliers and relevant third parties",
            },
            {
              name: "ID.IM-03: Improvements are identified from execution of operational processes, procedures, and activities",
            },
            {
              name: "ID.IM-04: Incident response plans and other cybersecurity plans that affect operations are established, communicated, maintained, and improved",
            },
          ],
        },
      ],
    },
    {
      name: "PROTECT (PR): Safeguards to manage the organization’s cybersecurity risks are used",
      categories: [
        {
          name: "Identity Management, Authentication, and Access Control (PR.AA): Access to physical and logical assets is limited to authorized users, services, and hardware and managed commensurate with the assessed risk of unauthorized access",
          subcategories: [
            {
              name: "PR.AA-01: Identities and credentials for authorized users, services, and hardware are managed by the organization",
            },
            {
              name: "PR.AA-02: Identities are proofed and bound to credentials based on the context of interactions",
            },
            {
              name: "PR.AA-03: Users, services, and hardware are authenticated",
            },
            {
              name: "PR.AA-04: Identity assertions are protected, conveyed, and verified",
            },
            {
              name: "PR.AA-05: Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties",
            },
            {
              name: "PR.AA-06: Physical access to assets is managed, monitored, and enforced commensurate with risk",
            },
          ],
        },
        {
          name: "Awareness and Training (PR.AT): The organization’s personnel are provided with cybersecurity awareness and training so that they can perform their cybersecurity-related acoes",
          subcategories: [
            {
              name: "PR.AT-01: Personnel are provided with awareness and training so that they possess the knowledge and skills to perform general acoes with cybersecurity risks in mind",
            },
            {
              name: "PR.AT-02: Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant acoes with cybersecurity risks in mind",
            },
          ],
        },
        {
          name: "Data Security (PR.DS): Data are managed consistent with the organization’s risk strategy to protect the confidentiality, integrity, and availability of information",
          subcategories: [
            {
              name: "PR.DS-01: The confidentiality, integrity, and availability of data-at-rest are protected",
            },
            {
              name: "PR.DS-02: The confidentiality, integrity, and availability of data-in-transit are protected",
            },
            {
              name: "PR.DS-10: The confidentiality, integrity, and availability of data-in-use are protected",
            },
            {
              name: "PR.DS-11: Backups of data are created, protected, maintained, and tested",
            },
          ],
        },
        {
          name: "Platform Security (PR.PS): The hardware, software (e.g., firmware, operating systems, applications), and services of physical and virtual platforms are managed consistent with the organization’s risk strategy to protect their confidentiality, integrity, and availability",
          subcategories: [
            {
              name: "PR.PS-01: Configuration management practices are established and applied",
            },
            {
              name: "PR.PS-02: Software is maintained, replaced, and removed commensurate with risk",
            },
            {
              name: "PR.PS-03: Hardware is maintained, replaced, and removed commensurate with risk",
            },
            {
              name: "PR.PS-04: Log records are generated and made available for continuous monitoring",
            },
            {
              name: "PR.PS-05: Installation and execution of unauthorized software are prevented",
            },
            {
              name: "PR.PS-06: Secure software development practices are integrated, and their performance is monitored throughout the software development life cycle",
            },
          ],
        },
        {
          name: "Technology Infrastructure Resilience (PR.IR): Security architectures are managed with the organization’s risk strategy to protect asset confidentiality, integrity, and availability, and organizational resilience",
          subcategories: [
            {
              name: "PR.IR-01: Networks and environments are protected from unauthorized logical access and usage",
            },
            {
              name: "PR.IR-02: The organization’s technology assets are protected from environmental threats",
            },
            {
              name: "PR.IR-03: Mechanisms are implemented to achieve resilience requirements in normal and adverse situations",
            },
            {
              name: "PR.IR-04: Adequate resource capacity to ensure availability is maintained",
            },
          ],
        },
      ],
    },
    {
      name: "DETECT (DE): Possible cybersecurity attacks and compromises are found and analyzed",
      categories: [
        {
          name: "Continuous Monitoring (DE.CM): Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events",
          subcategories: [
            {
              name: "DE.CM-01: Networks and network services are monitored to find potentially adverse events",
            },
            {
              name: "DE.CM-02: The physical environment is monitored to find potentially adverse events",
            },
            {
              name: "DE.CM-03: Personnel activity and technology usage are monitored to find potentially adverse events",
            },
            {
              name: "DE.CM-06: External service provider activities and services are monitored to find potentially adverse events",
            },
            {
              name: "DE.CM-09: Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events",
            },
          ],
        },
        {
          name: "Adverse Event Analysis (DE.AE): Anomalies, indicators of compromise, and other potentially adverse events are analyzed to characterize the events and detect cybersecurity incidents",
          subcategories: [
            {
              name: "DE.AE-02: Potentially adverse events are analyzed to better understand associated activities",
            },
            {
              name: "DE.AE-03: Information is correlated from multiple sources",
            },
            {
              name: "DE.AE-04: The estimated impact and scope of adverse events are understood",
            },
            {
              name: "DE.AE-06: Information on adverse events is provided to authorized staff and tools",
            },
            {
              name: "DE.AE-07: Cyber threat intelligence and other contextual information are integrated into the analysis",
            },
            {
              name: "DE.AE-08: Incidents are declared when adverse events meet the defined incident criteria",
            },
          ],
        },
      ],
    },
    {
      name: "RESPOND (RS): Actions regarding a detected cybersecurity incident are taken",
      categories: [
        {
          name: "Incident Management (RS.MA): Responses to detected cybersecurity incidents are managed",
          subcategories: [
            {
              name: "RS.MA-01: The incident response plan is executed in coordination with relevant third parties once an incident is declared",
            },
            {
              name: "RS.MA-02: Incident reports are triaged and validated",
            },
            {
              name: "RS.MA-03: Incidents are categorized and prioritized",
            },
            {
              name: "RS.MA-04: Incidents are escalated or elevated as needed",
            },
            {
              name: "RS.MA-05: The criteria for initiating incident recovery are applied",
            },
          ],
        },
        {
          name: "Incident Analysis (RS.AN): Investigations are conducted to ensure effective response and support forensics and recovery activities",
          subcategories: [
            {
              name: "RS.AN-03: Analysis is performed to establish what has taken place during an incident and the root cause of the incident",
            },
            {
              name: "RS.AN-06: Actions performed during an investigation are recorded, and the records’ integrity and provenance are preserved",
            },
            {
              name: "RS.AN-07: Incident data and metadata are collected, and their integrity and provenance are preserved",
            },
            {
              name: "RS.AN-08: An incident’s magnitude is estimated and validated",
            },
          ],
        },
        {
          name: "Incident Response Reporting and Communication (RS.CO): Response activities are coordinated with internal and external stakeholders as required by laws, regulations, or policies",
          subcategories: [
            {
              name: "RS.CO-02: Internal and external stakeholders are notified of incidents",
            },
            {
              name: "RS.CO-03: Information is shared with designated internal and external stakeholders",
            },
          ],
        },
        {
          name: "Incident Mitigation (RS.MI): Activities are performed to prevent expansion of an event and mitigate its effects",
          subcategories: [
            {
              name: "RS.MI-01: Incidents are contained",
            },
            {
              name: "RS.MI-02: Incidents are eradicated",
            },
          ],
        },
      ],
    },
    {
      name: "RECOVER (RC): Assets and operations affected by a cybersecurity incident are restored",
      categories: [
        {
          name: "Incident Recovery Plan Execution (RC.RP): Restoration activities are performed to ensure operational availability of systems and services affected by cybersecurity incidents",
          subcategories: [
            {
              name: "RC.RP-01: The recovery portion of the incident response plan is executed once initiated from the incident response process",
            },
            {
              name: "RC.RP-02: Recovery actions are selected, scoped, prioritized, and performed",
            },
            {
              name: "RC.RP-03: The integrity of backups and other restoration assets is verified before using them for restoration",
            },
            {
              name: "RC.RP-04: Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms",
            },
            {
              name: "RC.RP-05: The integrity of restored assets is verified, systems and services are restored, and normal operating status is confirmed",
            },
            {
              name: "RC.RP-06: The end of incident recovery is declared based on criteria, and incidentrelated documentation is concluido",
            },
          ],
        },
        {
          name: "Incident Recovery Communication (RC.CO): Restoration activities are coordinated with internal and external parties",
          subcategories: [
            {
              name: "RC.CO-03: Recovery activities and progress in restoring operational capabilities are communicated to designated internal and external stakeholders",
            },
            {
              name: "RC.CO-04: Public updates on incident recovery are shared using approved methods and messaging",
            },
          ],
        },
      ],
    },
  ],
};
