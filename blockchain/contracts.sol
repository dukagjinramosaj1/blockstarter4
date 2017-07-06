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

    //ENUM
    enum Stage { Funding, EndedSuccess, EndedFail }
    enum Vote { Undecided, Yes, No }

    //ATTRIBUTES
    address owner;
    string public title;
    string public description;
    uint public funding_goal;
    Stage stage;
    string poll;

    //EVENTS
    // Triggered when tokens are transferred.
    event Transfer(address indexed _from, address indexed _to, uint256 _value, uint256 _remainingSupply);
    event TransferAllowed(address indexed _from, address indexed _to, uint256 _value );

    mapping (address => uint) investments;
    address[] investors;

    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) allowed;

    address[] voters;
    mapping (address => bool) votes;
    uint numVoters = 0;

    bool killed = false;

    function Project(address _owner, string _title, string _description, uint _funding_goal) {
        owner = _owner;
        title = _title;
        description = _description;
        funding_goal = _funding_goal;
        stage = Stage.Funding;
        poll = "";
    }

    function invest() payable {
        if (stage != Stage.Funding) throw;
        if (msg.value == 0) throw;
        investments[msg.sender] += msg.value;
        investors.push(msg.sender);
    }


    // msg.sender(_investor) buys shares from a project _backer by sending ether to a project contract
    // backer receives ether for it which will be removed from the project contract
    function tradeShares(address _backer) payable returns (bool success) {
        address _investor = msg.sender;
        if (investments[_backer] >= msg.value
        && msg.value > 0
        && allowed[_backer][msg.sender] >= _amount
        && investments[_investor] + msg.value > investments[_investor]) {
            investments[_backer] -= msg.value;
            investments[_investor] += msg.value;
            allowed[_backer][msg.sender] -= _amount;
            //sending eth from contract to _backer
            _backer.send(msg.value);
            Transfer(_backer, _investor, msg.value, investments[_backer]);
            return true;
        } else {
            return false;
        }
    }

    function approveTrade(address _investor, uint256 _amount) returns (bool success) {
        allowed[msg.sender][_investor] = _amount;
        Approval(msg.sender, _investor, _amount);
        return true;
    }

    function start_poll(string _poll) {
        if (msg.sender != owner) throw;
        poll = _poll;
        numVoters = 0;
    }

    function vote_poll(bool vote_value) {
        if (investments[msg.sender] == 0) throw;

        bool alreadyVoted = false;
        // check if voter already voted
        for (uint i=0; i < voters.length; i++){
            if (voters[i] == msg.sender) {
                alreadyVoted = true;
            }
        }
        if (!alreadyVoted) {
            // add new voter to voters
            if (numVoters == voters.length) {
                voters.length +=1;
            }
            voters[numVoters++] = msg.sender;
        }

        // add or override vote
        votes[msg.sender] = vote_value;

    }

    function endFunding() {
        if (msg.sender != owner) throw;
        if (this.balance >= funding_goal) {
            stage = Stage.EndedSuccess;
            owner.transfer(this.balance);
        } else {
            stage = Stage.EndedFail;
            kill();
        }
    }

    function status() constant
    returns (address project_owner, string project_title, string project_description, string funding_stage, uint current_funding_amount, uint final_funding_goal, bool reached_goal, string current_poll, uint pro_poll, uint contra_poll)
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
        current_poll = poll;

        // count votes
        for (uint i = 0; i < numVoters; i++) {
            if (votes[voters[i]]) {
                // sum up to pro votes
                pro_poll += investments[voters[i]];
            } else {
                // sum up to contra votes
                contra_poll += investments[voters[i]];
            }
        }

        return (project_owner, project_title, project_description, funding_stage, current_funding_amount, final_funding_goal, reached_goal, current_poll, pro_poll, contra_poll);
    }
    function getFunding() returns ( uint funding){
        return investments[msg.sender];
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
}

