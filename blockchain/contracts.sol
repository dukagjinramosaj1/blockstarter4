pragma solidity ^0.4.0;

contract Blockstarter {
    
    function Blockstarter() {}
    
    address[] projects;
    
    function add_project(address project) {
        projects.push(project);
    }
    
    function project_count() constant returns (uint) {
        return (projects.length);
    }
    
    function project_address_at(uint index) constant returns (address) {
        return projects[index];
    }

    
}

contract Project { 
    
    enum Stage { Funding, Ended }

    address owner;
    string public title;
    string public description;
    uint public funding_goal;
    Stage stage;
    
    mapping (address => uint) investments;
    address[] investors;
    
    bool killed = false;
    
    function Project(string _title, string _description, uint _funding_goal) {
        owner = msg.sender;
        title = _title;
        description = _description;
        funding_goal = _funding_goal;
        stage = Stage.Funding;
    }

    function invest() payable {
        if (stage == Stage.Ended) throw;
        if (msg.value == 0) throw;
        investments[msg.sender] += msg.value;
        investors.push(msg.sender);
    }
    
    function endFunding() {
        if (msg.sender != owner) throw;
        stage = Stage.Ended;
    }
    
    function status() constant
        returns (address project_owner, string project_title, string project_description, string funding_stage,
        uint current_funding_amount, uint final_funding_goal, bool reached_goal)
    {
        current_funding_amount = this.balance;
        project_title = title;
        project_description = description;
        final_funding_goal = funding_goal;
        reached_goal = current_funding_amount >= funding_goal;
        if (stage == Stage.Funding) {
            funding_stage = "Funding";
        } else if (stage == Stage.Ended) {
            funding_stage = "Ended";
        }
        project_owner = owner;
        return (project_owner, project_title, project_description, funding_stage,
            current_funding_amount, final_funding_goal, reached_goal);
    }
    
    function kill() {
        if (msg.sender != owner) throw;
        for (uint i=0; i <investors.length; i++){
            address current = investors[i];
            uint amount = investments[current];
            if (amount == 0) return;
            // avoid the same investor getting repaid several times
            investments[current] = 0;
            current.transfer(amount);
        }
        selfdestruct(owner);
    }
}
