import React from 'react';
import axios from 'axios';

const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`,
  },
});

const GET_USER = (user) => `
{
  user(login: "${user}") {
    name
    login
    avatarUrl
    company

    gists{
     totalCount
   }

   following{
      totalCount
    }

    followers(last: 5){
      edges{
    		node{
          id
        	name
        	avatarUrl
          email

      	}
      }
    }

    organizations(last: 5){
      edges{
        node{
          id
          name
        }
      }
    }

    repositories(last: 5){
      edges{
        node{
          id
          name
        }
      }
    }

  }
}
`;

export default class App extends React.Component{

  state = {
   path: '<user-login>',
   user: null,
   errors: null,
  };

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = event => {
   this.setState({ path: event.target.value });
  };

  onSubmit = event => {
   this.onFetchFromGitHub(this.state.path);

   event.preventDefault();
  };

  onFetchFromGitHub = path => {
    const [user] = path.split();

    axiosGitHubGraphQL
      .post('', { query: GET_USER(user), })
      .then(result =>
        this.setState(() => ({
          user: result.data.data.user,
          errors: result.data.errors,
        })),
      );
  }



    render(){
      const { path, user, errors } = this.state;

        return (

            <div>
                <div><h1>User Data:</h1></div>

                <form onSubmit={this.onSubmit}>
                  <label htmlFor="url">
                  Username:
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={path}
                    onChange={this.onChange}
                    style={{ width: '100px' }}
                    />
                    <button type="submit">Search</button>
                </form>

        <hr />

        {user ? (<User user={user} errors={errors} />) : (<p>No information yet ...</p>)}

            </div>

               );
    }


}

const User = ({ user, errors }) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong:</strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    );
  }

  const Followers = ({ followers }) => (
  <div>

    <strong>Followers:</strong>

    <ul>
     {followers.edges.map(followers => (
       <li key={followers.node.id}>
        <img src={followers.node.avatarUrl}/>

        {followers && followers.node && followers.node.name &&
            (<div>Name:{followers.node.name}</div>)
        }

        {followers && followers.node && followers.node.email &&
            (<div>Email:{followers.node.email}</div>)
        }

       </li>
     ))}
   </ul>

  </div>
  );

  const Organizations = ({ organizations }) => (
  <div>

    <strong>Organizations:</strong>

    <ul>
     {organizations.edges.map(organizations => (
       <li key={organizations.node.id}>

       {organizations && organizations.node && organizations.node.name &&
           (<div>Name:{organizations.node.name}</div>)
       }

       </li>
     ))}
   </ul>

  </div>
  );

  const Repositories = ({ repositories }) => (
  <div>

    <strong>Repositories:</strong>

    <ul>
     {repositories.edges.map(repositories => (
       <li key={repositories.node.id}>

       {repositories && repositories.node && repositories.node.name &&
           (<div>Name:{repositories.node.name}</div>)
       }

       </li>
     ))}
   </ul>

  </div>
  );

  return (
    <div>
      <p>
        <strong>User Data:</strong>

        {user && user.avatarUrl &&
          (<div><img src={user.avatarUrl}/></div>)
        }

        {user && user.login &&
          (<div>Login:{user.login}</div>)
        }

        {user && user.name &&
          (<div>Name:{user.name}</div>)
        }

        {user && user.company &&
          (<div>Company:{user.company}</div>)
        }

        {user && user.gists && user.gists.totalCount &&
          (<div>Number of Gists:{user.gists.totalCount}</div>)
        }

        {user && user.following && user.following.totalCount &&
          (<div>Following:{user.following.totalCount}</div>)
        }

      </p>

         <Repositories repositories={user.repositories} />
         <Organizations organizations={user.organizations} />
         <Followers followers={user.followers} />

    </div>
  );
};
