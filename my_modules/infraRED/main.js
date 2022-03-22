parsedDesign = {
    tosca_definitions_version: "tosca_simple_yaml_1_3tosca_simple_yaml_1_3",
    description: "Template for deploying a two-tier application on two servers.",
    topology_template: {
        node_templates: {
            "db_server": {
                type: "tosca.nodes.Compute",
                capabilities: {
                    "host": {
                        properties: {
                            "num_cpus": 1,
                            "disk_size": "10 GB",
                            "mem_size": "4096 MB"
                        }
                    },
                    "os": {
                        properties: {
                            "architecture": "x86_64",
                            "type": "linux",
                            "distribution": "rhel", 
                            "version": "6.5" 
                        }
                    }
                }
            }
        },
        relationship_templates: {
            "wp_db_connection": {
                type: "ConnectsTo",
                interfaces: {
                    "Configure": {
                        "pre_configure_source": "scripts/wp_db_configure.sh"
                    }
                }
            }
        }
    }
};
  
infraRED.init();