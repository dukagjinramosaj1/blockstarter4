pragma solidity ^0.4.0;

contract Blockstarter {
    
    function Blockstarter() {}
    
    address[] projects;
    
	  function remove_project(address project) {
		    uint i = 0;
		    bool found = false;
		    for (; i < projects.length; i++) {
			      if (found) {
				        projects[i] = projects[i+1];
			      } else {
				        if (projects[i] == project) {
					          found = true;
					          delete projects[i];
				        }
			      }
		    }
		    if (found) {
			      projects.length--;
		    }
    }
    
    function create_project(string _title, string _description, uint _goal) {
        projects.push(new Project(msg.sender, _title, _description, _goal));
    }
    
    function project_count() constant returns (uint) {
        return (projects.length);
    }
    
    function project_address_at(uint index) constant returns (address) {
        return projects[index];
    }

    
}

contract Project { 
    
    enum Stage { Funding, EndedSuccess, EndedFail }

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
        if (stage != Stage.Funding) throw;
        if (msg.value == 0) throw;
        investments[msg.sender] += msg.value;
        investors.push(msg.sender);
    }
    
    function endFunding() {
        if (msg.sender != owner) throw;
		if (this.balance >= funding_goal) {
			stage = Stage.EndedSuccess;
		} else {
			stage = Stage.EndedFail;
			kill();
		}
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
        } else if (stage == Stage.EndedSuccess) {
            funding_stage = "Ended successfully";
        } else if (stage == Stage.EndedFail) {
            funding_stage = "Ended without success";
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

    function is_funder(address funder) constant returns (bool) {
      for (var i = 0; i < investors.length; i++) {
        if (investors[i] == funder) {
          return true;
        }
      }
      return false;
    }
    
    function withdraw(uint amount) {
		if (stage != Stage.EndedSuccess) throw;
		if (msg.sender != owner) throw;
		if (amount == 0) return;
		if (amount > this.balance) throw;
        owner.transfer(amount);
    }
}
