pragma solidity ^0.4.0;

contract Blockstarter {
    
    function Blockstarter() {}
    
    address[] projects;
    
    function createProject(string _title, string _description, uint _funding_goal) {
        address owner = msg.sender;
        address newProject = new Project(owner, _title, _description, _funding_goal);
        projects.push(newProject);
    }
    
    function getProjectCount() returns (uint _length) {
        _length = projects.length;
    }
    
    function getProjectAddressAt(uint index) returns (address project) {
        project = projects[index];
    }
    
    function getProjectAt(uint index) 
        returns (string, string, string, uint, uint, bool) {
        address project = getProjectAddressAt(index);
        return getProject(project);
    }
    
    function getProject(address project)
        returns (string, string, string, uint, uint, bool) {
        return Project(project).funding_status();
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
    
    function Project(address _owner, string _title, string _description, uint _funding_goal) {
        owner = _owner;
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
    
    function funding_status() constant
        returns (string project_title, string project_description, string funding_stage,
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
        return (project_title, project_description, funding_stage,
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
