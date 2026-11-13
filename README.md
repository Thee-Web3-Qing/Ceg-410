# CEG 410 Structural Analysis Studio

A browser-based **JavaScript-only** 2D truss analysis tool for the CEG 410 group assignment.

## Run locally
Open `index.html` in a browser. For the source-code panel to load, serve the folder using `npx serve .` or another static server. No Python is needed.

## Interface
- **Top left:** actual read-only `solver.js` source code.
- **Right:** structural diagram, adjustable material/load inputs, computed forces, reactions and displacements.
- **Bottom:** collapsible execution log showing solver stages. This is an in-app solver log, **not a system shell**.
- The vertical divider is draggable on desktop.

## Engineering implementation
Uses the **matrix displacement method** for a linear-elastic, small-displacement, planar pin-jointed truss. For each member, the solver assembles the 4×4 global stiffness contribution using direction cosines, applies displacement boundary conditions, solves `K_ff u_f = F_f` using Gaussian elimination with partial pivoting, recovers reactions `R = Ku - F`, and recovers axial forces `N = (EA/L)[-c,-s,c,s]u_e`. Positive member force is tension; negative is compression.

**Units:** E in GPa, A in mm², load in kN, geometry in metres, output displacement in mm.

**Scope:** This initial version contains a fixed four-node, five-member example with adjustable E, A and load. It is not yet a general 1000-member truss modeller, slope-deflection solver, or member design checker. Those require separate implementation and verification. Results must be independently checked before engineering use.

## Verify
Run `node test.js` using Node.js. The tests check equilibrium and symmetry for the example.
