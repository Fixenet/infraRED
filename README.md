# infraRED

## PROJECT: InfraRED: A Visual and Flow-based Designer of Smart IT Infrastructures

#### Objectives
The DevOps "culture" advocates software engineering best practices and tools in order to ensure continuously evolving complex systems, promoting a tight collaboration between the developers (Dev) and the teams that deploy and operate the systems (Ops). 

Current solutions and tools lack mechanisms for the ease of Design and for continuous deployment and evolution of the systems across different spaces (from IoT, to edge, core and clouds) as well as for the continuous quality assurance, such as mechanisms to ensure end-to-end security and privacy, and mechanisms to allow continuous testing of IT Infrastructures (within emulated and simulated infrastructures). 

At the Network level, the dynamism of Software Defined Networking (SDN), Network Functions Virtualization (NFV) and Intent-based Networking (IBN) might even make easier to design, and build infrastructures with more flexible services and capabilities, making possible to link network functions through Service Function Chaining (SFC) to produce new services. 

This project intends to propose and develop InfraRED, a Proof-of-Concept (PoC) toolset to enable trustworthy DevOps in the realm of IT Infrastructures, with a visual tool that aims at improving the proper design, the management, the continuous delivery and continuous orchestration of these systems, also ensuring their traceability. 

#### The InfraRED tool should be able to: 
- be a (visual) programming tool, browser-based (e.g., JavaScipt), 
- follow Infrastructure-as-Code (IaC) principles, for wiring together hardware devices, virtualised resources (typically through APIs) and Cloud-based resources/services, 
- invoke transactions that create, configure, update, and delete assets. 
- manage and monitor servers, networks and services, and automate sysadmin related tasks, 
- visually compare the live IT environment state before and after a deployment, as part of the automated Continuous- Integration/Delivery (CI/CD) pipeline. 

A PoC prototype shall be built, deployed and tested. The results obtained shall be validated based on real scenarios to be defined.

#### Running
`npm install`
`grunt build`
`node distribution/index.js`
